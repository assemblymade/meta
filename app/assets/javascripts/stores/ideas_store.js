var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var currentIdeas = []

class IdeasStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.IDEAS_RECEIVE:
          _setIdeas(action)
          this.emitChange()
          break
      }
    })
  }

  getIdeas() {
    return currentIdeas
  }
}

module.exports = new IdeasStore()

function _setIdeas(action) {
  currentIdeas = action.ideas
}
