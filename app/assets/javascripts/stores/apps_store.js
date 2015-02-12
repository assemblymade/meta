var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var _apps = null

class AppsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.APPS_START_SEARCH:
          _apps = null
          break

        case ActionTypes.APPS_RECEIVE:
          _apps = action.apps
          break

        case ActionTypes.APPS_RECEIVE_SEARCH_RESULTS:
          _apps = _.pluck(action.results.hits.hits, '_source')
          break

        default:
          return
      }
      this.emitChange()
    });
  }

  getApps() {
    return _apps
  }
}

var store = new AppsStore()

module.exports = store
