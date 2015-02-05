var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var dashboard = {}

class DashboardStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.DASHBOARD_RECEIVE:
          dashboard = action.dashboard
          this.emitChange()
          break
      }
    })
  }

  getDashboard() {
    return dashboard
  }
}

module.exports = new DashboardStore()
