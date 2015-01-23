var ActionTypes = window.CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;
var NProgress = require('nprogress');
var page = require('page');
var qs = require('qs');
var url = require('url');

class Router {
  constructor(actionType, routes) {
    this.actionType = actionType;
    this.routes = routes;
  }

  initialize() {
    page('*', _parse);
    this.routes.forEach(this._route.bind(this));
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
    page.stop();
  }

  _getAndDispatch(component, callback) {
    var self = this;

    return _.debounce((context) => {
      NProgress.start();

      _callAndDispatch(self.actionType, component, context, callback);
    }, 500);
  }

  _route(route) {
    var path = route[0]
    var component = route[1]
    var callback = route[2]

    page(path, this._getAndDispatch(component, callback))
  }
};

module.exports = Router;

function _callAndDispatch(actionType, component, context, callback) {
  $.getJSON(window.location, { cache: false }).
  done(callback).
  done(function(data) {
    NProgress.done();

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
