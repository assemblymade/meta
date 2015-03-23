var DiscussionStore = require('./discussion_store');
var Store = require('./es6_store')

var _heartables = {}
var _userHearts = {}

var Dispatcher = require('../dispatcher')
var ActionTypes = require('../constants').ActionTypes;
var LoveActionCreators = require('../actions/love_action_creators');

class LoveStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.DISCUSSION_RECEIVE:
          setHeartables(action.comments);
          setUserHearts(action.userHearts);
          break

        case ActionTypes.NEWS_FEED_ITEM_CONFIRM_COMMENT:
          var data = action.data
          _heartables[data.comment.id] = {
            heartable_type: 'NewsFeedItemComment',
            heartable_id: data.comment.id,
            hearts_count: 0
          }
          break

        case ActionTypes.LOVE_RECEIVE_HEARTABLES:
          _heartables = _.reduce(
            action.heartables,
            function(memo, h) {
              memo[h.id] = h;
              return memo
            },
            {}
          );
          break

        case ActionTypes.LOVE_RECEIVE_ALL_HEARTS:
          break

        case ActionTypes.LOVE_RECEIVE_USER_HEARTS:
          _userHearts = _.reduce(
            action.userHearts,
            function(memo, h) {
              memo[h.heartable_id] = h;
              return memo
            },
            {}
          );
          break

        case ActionTypes.LOVE_CLICKED:
          _heartables[action.heartable_id].hearts_count += 1
          _userHearts[action.heartable_id] = {} // optimistic heart
          break

        case ActionTypes.LOVE_UNCLICKED:
          _heartables[action.heartable_id].hearts_count -= 1
          delete _userHearts[action.heartable_id]
          break

        case ActionTypes.LOVE_RECEIVE_RECENT_HEARTS:
          _(action.recent_hearts).each(function(heart) {
            if (!_heartables[heart.heartable_id]) {
              _heartables[heart.heartable_id] = {};
            }

            if (!_heartables[heart.heartable_id].hearts) {
              _heartables[heart.heartable_id].hearts = []
            }

            _heartables[heart.heartable_id].hearts.push(heart)
          })

          _(action.user_hearts).each(function(heart){
            _userHearts[heart.heartable_id] = heart
          })
          break

        case ActionTypes.WIP_EVENT_CREATED:
          var event = action.event
          _heartables[event.news_feed_item_comment_id] = {
            heartable_type: 'Event',
            heartable_id: event.news_feed_item_comment_id,
            hearts_count: 0
          }
          break

        case ActionTypes.NEWS_FEED_RECEIVE_RAW_ITEMS:
          var items = action.data.items
          _(items).each(function(item){
            var heartables = [item].concat(item.last_comment)
            _(heartables).each(function(h){
              if (h) {
                _heartables[h.heartable_id] = {
                  heartable_type: h.heartable_type,
                  heartable_id: h.heartable_id,
                  hearts_count: h.hearts_count
                }
              }
            })
          })
          var userHearts = action.data.user_hearts
          _(userHearts || []).each(function(h){
            _userHearts[h.heartable_id] = h
          })

          break

        case ActionTypes.CHAT_MESSAGE_RECEIVE_ACTIVITIES:
          _(action.activities).each(function(activity){
            _heartables[activity.id] = {
              heartable_type: 'Activity',
              heartable_id: activity.id,
              hearts_count: activity.hearts_count
            }
          })
          break

        default:
          return
      } // switch
      this.emitChange()
    }) // register
  }

  get(heartable_id) {
    var heartable = _.extend({}, _heartables[heartable_id])
    if (_userHearts[heartable_id]) {
      heartable.user_heart = _userHearts[heartable_id]
    }
    return heartable
  }

  getAllHeartableIds() {
    return _.keys(_heartables)
  }
}

var store = new LoveStore();

function setHeartables(heartables) {
  _heartables = _.extend(_heartables, _.reduce(heartables, _reduceHeartables, {}));
}

function setUserHearts(heartables) {
  _userHearts = _.extend(_userHearts, _.reduce(heartables, _reduceHeartables, {}));
}

function _reduceHeartables(memo, h) {
  memo[h.heartable_id || h.id] = h;
  return memo;
}

// Load initial data from script tags on the page (if they're present)
// TODO: Separate LoveStore and UserLoveStore

var loveStoreDataTag = document.getElementById('LoveStore')
if (loveStoreDataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
    heartables: JSON.parse(loveStoreDataTag.innerHTML)
  })
}
var userLoveStoreDataTag = document.getElementById('UserLoveStore')
if (userLoveStoreDataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_USER_HEARTS,
    userHearts: JSON.parse(userLoveStoreDataTag.innerHTML)
  })
}

module.exports = store;
