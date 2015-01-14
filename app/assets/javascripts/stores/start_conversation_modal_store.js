var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes
var Dispatcher = window.Dispatcher
var Store = require('./es6_store')

var modalShown = false

class StartConversationModalStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.START_CONVERSATION_MODAL_HIDDEN:
          modalShown = false
          this.emitChange()
          break
        case ActionTypes.IDEAS_NEW_IDEA_CREATED:
          modalShown = true
          this.emitChange()
          break
      }
    })
  }

  isModalShown() {
    return modalShown
  }
}

module.exports = new StartConversationModalStore()
