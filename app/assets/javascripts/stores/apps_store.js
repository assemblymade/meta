var ActionTypes = window.CONSTANTS.ActionTypes
var AppsActionCreators = require('../actions/apps_action_creators')
var Store = require('./es6_store')
var url = require('url')

var _apps = []

class AppsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.APPS_RECEIVE:
          _apps = action.apps

          this.emitChange()
          break
      }
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
  AppsActionCreators.filterSelected(query.filter, query.topic)
}

module.exports = store
