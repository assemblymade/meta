var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var currentComponent = null
var currentContext = {}

class RoutesStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.ASM_APP_ROUTE_CHANGED:
          _setData(action)
          this.emitChange()
          break
      }
    })
  }

  getComponent() {
    return currentComponent
  }

  getContext() {
    return currentContext
  }
}

module.exports = new RoutesStore()

function _setData(action) {
  currentComponent = action.component || currentComponent
  currentContext = action.context || currentContext
}
