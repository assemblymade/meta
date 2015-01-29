var ActionTypes = window.CONSTANTS.ActionTypes;
var allRoutes = require('../routes/routes');
var Dispatcher = window.Dispatcher;
var NProgress = require('nprogress');
var page = require('page');
var qs = require('qs');
var url = require('url');

class Router {
  initialize() {
    page('*', _parse);
    page.start();
  }

  navigate(url, e) {
    e && e.preventDefault();
    page(url);
  }

  stop() {
    page.stop();
  }

  _get(actionType, component, callback) {
    var self = this;

    return _.debounce((context) => {
      NProgress.start();

      _callAndDispatch(actionType, component, context, callback);
    }, 500);
  }

  route(actionType, route) {
    var path = route[0]
    var component = route[1]
    var callback = route[2]

    page(path, this._get(actionType, component, callback))
  }
};

var _Router = new Router();

var action, routes;
for (var exported in allRoutes) {
  routes = allRoutes[exported];

  routes.forEach(_Router.route.bind(_Router, ActionTypes.ASM_APP_ROUTE_CHANGED));
}

module.exports = _Router;

function _callAndDispatch(actionType, component, context, callback) {
  $.getJSON(window.location, { cache: false }).
  always(() => {
    NProgress.done();
  }).
  fail((jqXhr, _, errorString) => {
    switch (jqXhr.status) {
      case 401:
        window.location.pathname = '/signup';
        break;
      case 500:
        window.location.pathname = '/500';
        break;
      default:
        // what should we do here?
    }
  }).
  done(callback).
  done((data) => {
    Dispatcher.dispatch({
      type: actionType,
      component: component,
      context: context
    });
  });
}

function _parse(context, next) {
  context.query = qs.parse(context.querystring)
  next()
}
