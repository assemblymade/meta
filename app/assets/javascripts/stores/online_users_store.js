var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _currentChatRoomId
var _presenceChannel
var _usersOnline = {};

class OnlineUsersStore extends EventEmitter {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PUSHER_PRESENCE_CONNECTED:
          _presenceChannel = action.presenceChannel
          this.emit('change')
          break

        case ActionTypes.CHAT_USER_ONLINE:
          _usersOnline[action.rawMember.id] = 1
          this.emit('change')
          break
      }
    })
  }

  getPresenceChannel() {
    return _presenceChannel
  }
}

module.exports = new OnlineUsersStore();
