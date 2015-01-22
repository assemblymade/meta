var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes
var ideasRoutes = require('../routes/ideas_routes')
var NProgress = require('nprogress')
var page = require('page')
var qs = require('qs')
var url = require('url');

class IdeasRouter {
  constructor(routes) {
    page('*', _parse);

    routes.forEach(_route)
  }

  initialize() {
    page.start()

    // The router will have fired before the component mounted, so we need
    // to call `navigate` after mounting
    var parsedUrl = url.parse(window.location.toString());
    this.navigate(parsedUrl.path);
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
    NProgress.start()

    $.getJSON(window.location, { cache: false }).done(callback)
    .done(function(data) {
      NProgress.done()
      Dispatcher.dispatch({
        type: ActionTypes.IDEAS_ROUTE_CHANGED,
        component: component,
        context: context
      })
    })
  }, 500)
}
