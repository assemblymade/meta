var _dispatchToken
var _heartables = {}
var _userHearts = {}

// var Dispatcher = require('../dispatcher')
var Store = require('../stores/store')
var ActionTypes = window.CONSTANTS.ActionTypes
var LoveActionCreators = require('../actions/love_action_creators')

var LoveStore = _.extend(Object.create(Store), {
  init: function(rawHeartables, rawUserHearts) {
    _heartables = _.reduce(rawHeartables, function(memo, h){ memo[h.heartable_id] = h; return memo }, {})
    _userHearts = _.reduce(rawUserHearts, function(memo, h){ memo[h.heartable_id] = h; return memo }, {})

    _dispatchToken = Dispatcher.register(function(payload) {
      var action = payload.action

      if (typeof action.type !== 'undefined') {
        switch(action.type) {
          case ActionTypes.LOVE_CLICKED:
            _heartables[action.heartable_id].hearts_count += 1
            _userHearts[action.heartable_id] = {} // optimistic heart
            this.emitChange()
            break

          case ActionTypes.LOVE_UNCLICKED:
            _heartables[action.heartable_id].hearts_count -= 1
            delete _userHearts[action.heartable_id]
            this.emitChange()
            break

          case ActionTypes.LOVE_RECEIVE_RECENT_HEARTS:
            _(action.hearts).each(function(heart) {
              if (!_heartables[heart.heartable_id].hearts) {
                _heartables[heart.heartable_id].hearts = []
              }
              _heartables[heart.heartable_id].hearts.push(heart)
            })
            this.emitChange()
            break

          case ActionTypes.WIP_EVENT_CREATED:
            var event = action.event
            _heartables[event.news_feed_item_comment_id] = {
              heartable_type: 'Event',
              heartable_id: event.news_feed_item_comment_id,
              hearts_count: 0
            }
            this.emitChange()
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

            this.emitChange()
            break
        }

      }
    }.bind(this))
  },
  get: function(heartable_id) {
    var heartable = _.extend({}, _heartables[heartable_id])
    if (_userHearts[heartable_id]) {
      heartable.user_heart = _userHearts[heartable_id]
    }
    return heartable
  },

  getAllHeartableIds: function() {
    return _.keys(_heartables)
  }
})

// Load initial data from script tags on the page (if they're present)
var heartablesJson = {},
    userHeartsJson = {};

var jsonTag = document.getElementById('heartables')
if (jsonTag) {
  heartablesJson = JSON.parse(jsonTag.innerHTML)
}
var jsonTag = document.getElementById('user_hearts')
if (jsonTag) {
  userHeartsJson = JSON.parse(jsonTag.innerHTML)
}

LoveStore.init(heartablesJson, userHeartsJson)

LoveActionCreators.retrieveRecentHearts(LoveStore.getAllHeartableIds())

module.exports = LoveStore
