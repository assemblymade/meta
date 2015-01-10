var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes
var ideasRoutes = require('./ideas_routes')
var page = require('page')
var qs = require('qs')

class IdeasRouter {
  constructor(routes) {
    page('*', _parse);

    routes.forEach(_route)

    page.start()
  }

  navigate(url, e) {
    e && e.preventDefault();
    page(url);
  }

  stop() {
    page.stop()
  }
}

var router = new IdeasRouter(ideasRoutes)

module.exports = router;

function _parse(context, next) {
  context.query = qs.parse(context.querystring)
  next()
}

function _route(route) {
  var path = route[0]
  var component = route[1]
  var callback = route[2]

  page(path, _getAndDispatch(component, callback))
}

function _getAndDispatch(component, callback) {
  return _.debounce(function(context) {
    Dispatcher.dispatch({
      type: ActionTypes.IDEAS_ROUTE_CHANGED,
      component: component,
      context: context
    })

    $.getJSON(window.location, callback)
  }, 500)
}
