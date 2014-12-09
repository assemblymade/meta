var Store = require('./es6_store')

var _dispatchToken
var _heartables = {}
var _userHearts = {}

// var Dispatcher = require('../dispatcher')
var ActionTypes = window.CONSTANTS.ActionTypes;
var LoveActionCreators = require('../actions/love_action_creators');

class LoveStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.LOVE_RECEIVE_HEARTABLES:
          _heartables = _.reduce(action.heartables, function(memo, h){ memo[h.heartable_id] = h; return memo }, {})
          LoveActionCreators.retrieveRecentHearts(this.getAllHeartableIds())
          this.emit('change')
          break

        case ActionTypes.LOVE_RECEIVE_USER_HEARTS:
          _userHearts = _.reduce(action.userHearts, function(memo, h){ memo[h.heartable_id] = h; return memo }, {})
          this.emit('change')
          break

        case ActionTypes.LOVE_CLICKED:
          _heartables[action.heartable_id].hearts_count += 1
          _userHearts[action.heartable_id] = {} // optimistic heart
          this.emit('change')
          break

        case ActionTypes.LOVE_UNCLICKED:
          _heartables[action.heartable_id].hearts_count -= 1
          delete _userHearts[action.heartable_id]
          this.emit('change')
          break

        case ActionTypes.LOVE_RECEIVE_RECENT_HEARTS:
          _(action.recent_hearts).each(function(heart) {
            if (!_heartables[heart.heartable_id].hearts) {
              _heartables[heart.heartable_id].hearts = []
            }
            _heartables[heart.heartable_id].hearts.push(heart)
          })
          _(action.user_hearts).each(function(heart){
            _userHearts[heart.heartable_id] = heart
          })
          this.emit('change')
          break

        case ActionTypes.WIP_EVENT_CREATED:
          var event = action.event
          _heartables[event.news_feed_item_comment_id] = {
            heartable_type: 'Event',
            heartable_id: event.news_feed_item_comment_id,
            hearts_count: 0
          }
          this.emit('change')
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

          this.emit('change')
          break

        case ActionTypes.CHAT_MESSAGE_RECEIVE_ACTIVITIES:
          _(action.activities).each(function(activity){
            _heartables[activity.id] = {
              heartable_type: 'Activity',
              heartable_id: activity.id,
              hearts_count: activity.hearts_count
            }
          })
          LoveActionCreators.retrieveRecentHearts(this.getAllHeartableIds())
          this.emit('change')
          break

      } // switch
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

// Load initial data from script tags on the page (if they're present)
var heartablesJson = {},
    userHeartsJson = {};

var dataTag = document.getElementById('heartables')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
    heartables: JSON.parse(dataTag.innerHTML)
  })
}
var dataTag = document.getElementById('user_hearts')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_USER_HEARTS,
    userHearts: JSON.parse(dataTag.innerHTML)
  })
}

module.exports = store;
