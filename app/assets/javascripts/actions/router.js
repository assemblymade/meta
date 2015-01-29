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

  _get(component, callback) {
    var self = this;

    return _.debounce((context) => {
      NProgress.start();

      _callAndDispatch(component, context, callback);
    }, 500);
  }

  route(route) {
    var path = route[0]
    var component = route[1]
    var callback = route[2]

    page(path, this._get(component, callback))
  }
};

var _Router = new Router();

for (var exported in allRoutes) {
  allRoutes[exported].forEach(_Router.route.bind(_Router));
}

module.exports = _Router;

function _callAndDispatch(component, context, callback) {
  $.getJSON(context.canonicalPath, { cache: false }).
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
    TrackEngagement.track(context.canonicalPath, context);

    Dispatcher.dispatch({
      type: ActionTypes.ASM_APP_ROUTE_CHANGED,
      component: component,
      context: context
    });
  });
}

function _parse(context, next) {
  context.query = qs.parse(context.querystring)
  next()
}
