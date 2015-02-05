var EventEmitter = require('events').EventEmitter
var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');

var _messages = {}, _dispatchToken;

class ChatMessageStore extends EventEmitter {
  constructor() {
    super()
    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.CHAT_MESSAGE_RECEIVE_ACTIVITIES:
          break
      }
    })
  }
}

var store = new ChatMessageStore()

var dataTag = document.getElementById('ChatMessageStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.CHAT_MESSAGE_RECEIVE_ACTIVITIES,
    activities: JSON.parse(dataTag.innerHTML)
  })
}

module.exports = store
