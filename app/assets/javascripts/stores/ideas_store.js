var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var currentIdeas = []
var currentProduct
var lastProduct

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

  getCurrentProduct() {
    return currentProduct
  }

  getLastProduct() {
    return lastProduct
  }
}

module.exports = new IdeasStore()

function _setIdeas(action) {
  currentIdeas = action.ideas
  currentProduct = action.currentProduct
  lastProduct = action.lastProduct
}
