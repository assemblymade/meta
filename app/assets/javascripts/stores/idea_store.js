var CONSTANTS = window.CONSTANTS // require('../constants')
var ActionTypes = CONSTANTS.ActionTypes
var Store = require('./es6_store')

var currentIdea = {}

class IdeaStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.IDEA_RECEIVE:
        case ActionTypes.IDEAS_NEW_IDEA_CREATED:
          _setIdea(action)
          this.emitChange()
          break
      }
    })
  }

  getIdea() {
    return currentIdea
  }
}

module.exports = new IdeaStore()

function _setIdea(action) {
  currentIdea = action.idea
}
