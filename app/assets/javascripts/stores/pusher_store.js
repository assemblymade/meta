var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes;

var _dispatchToken = null,
    _client = null

class PusherStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PUSHER_INITIALIZED:
          _client = action.client
          this.emitChange()
          break;
      }
    })
  }

  getClient() {
    return _client
  }

  getDispatchToken() {
    return _dispatchToken
  }
}

module.exports = new PusherStore()
