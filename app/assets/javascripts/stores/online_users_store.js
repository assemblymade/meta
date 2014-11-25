// var Dispatcher = require('../dispatcher')
var Store = require('../stores/store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _currentChatRoomId
var _presenceChannel
var _usersOnline = {};

var OnlineUsersStore = _.extend(Object.create(Store), {
  getCurrentChatRoomId: function() {
    return _currentChatRoomId
  },

  getPresenceChannel: function() {
    return _presenceChannel
  }
})

_dispatchToken = Dispatcher.register(function(payload){
  var action = payload.action

  console.log(payload)

  if (typeof action.type !== 'undefined') {

    switch(action.type) {
      case ActionTypes.PUSHER_PRESENCE_CONNECTED:
        _presenceChannel = action.presenceChannel
        OnlineUsersStore.emitChange()
        break

      case ActionTypes.CHAT_USER_ONLINE:
        _usersOnline[action.rawMember.id] = 1
        OnlineUsersStore.emitChange()
        break

    }
  }
})

module.exports = OnlineUsersStore
