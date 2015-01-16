var ActionTypes = window.CONSTANTS.ActionTypes
var AppsActionCreators = require('../actions/apps_action_creators')
var Store = require('./es6_store')
var url = require('url')

var _apps = null

class AppsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      console.log(action)
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
    })
  }

  getApps() {
    return _apps
  }
}

var store = new AppsStore()

var dataTag = document.getElementById('AppsStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.APPS_RECEIVE,
    apps: JSON.parse(dataTag.innerHTML)
  })
} else {
  var query = url.parse(window.location.href, true).query
  if (query.search) {
    AppsActionCreators.search(query.search)
  } else {
    AppsActionCreators.filterSelected(query.filter, query.topic)
  }
}

module.exports = store
