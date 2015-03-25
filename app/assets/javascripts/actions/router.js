'use strict'

var ActionTypes = require('../constants').ActionTypes;
var allRoutes = require('../routes/routes');
var Dispatcher = require('../dispatcher');
var NProgress = require('nprogress');
var page = require('page');
var qs = require('qs');
var url = require('url');

var BLACKLIST = [
  '/home',
  '/about',
  '/terms',
  '/core-team',
  '/pitchweek',
  '/sabbaticals',
  '/activity',
  '/getting-started',
  '/create',
  '/start',
  '/styleguide',
  '/discover',
  '/login',
  '/user',
  '/logout',
  '/signup',
  '/settings',
  '/channel',
  '/help'
];

class Router {
  initialize() {
    page.start();
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

  route(routeList) {
    var path = routeList[0]
    var component = routeList[1]
    var callback = routeList[2]

    page(path, this._get(component, callback))
  }
};

var _Router = new Router();

page('*', _parse);
_blacklist();

allRoutes.forEach(_Router.route.bind(_Router));

module.exports = _Router;

// FIXME (pletcher): This is a hack while we still have pages that
// won't render entirely client-side. We can gradually remove
// routes from `BLACKLIST` as we component-ize the application.

function _blacklist() {
  var redirect = (context, next) => {
    if (BLACKLIST.indexOf(context.path) > -1) {
      return window.location.pathname = context.canonicalPath;
    }

    next();
  };

  page(redirect);
}

function _callAndDispatch(component, context, callback) {
  $.getJSON(context.canonicalPath, { cache: false }).
  always(NProgress.done).
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
        break;
    }
  }).
  done(callback).
  done(data => {
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
