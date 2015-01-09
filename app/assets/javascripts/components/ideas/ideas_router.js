// var Dispatcher = require('../../dispatcher');
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

  navigate(url) {
    page(url);
  }

  stop() {
    page.stop()
  }
}

var router = new IdeasRouter(ideasRoutes);

module.exports = router;

function _parse(context, next) {
  context.query = qs.parse(context.querystring);
  next();
}

function _route(route) {
  var path = route[0];
  var component = route[1];

  page(path, _getAndDispatchData(component));
}

function _getAndDispatchData(component) {
  return _.debounce(function(context) {
    $.getJSON(window.location, function(ideas) {
      Dispatcher.dispatch({
        type: ActionTypes.IDEAS_ROUTE_CHANGED,
        component: component,
        context: context,
        ideas: ideas
      })
    })
  }, 500)
}
