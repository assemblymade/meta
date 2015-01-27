var ActionTypes = window.CONSTANTS.ActionTypes
var Store = require('./es6_store')

var currentComponent = null
var currentContext = {}

class DashboardRoutesStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.DASHBOARD_ROUTE_CHANGED:
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

module.exports = new DashboardRoutesStore()

function _setData(action) {
  currentComponent = action.component || currentComponent
  currentContext = action.context || currentContext
}
