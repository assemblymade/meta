global.React = require('react/addons');
global.TestUtils = React.addons.TestUtils;
global.path = require.requireActual('path');
global._ = require('underscore');
global.$ = require('jquery');
global.app = {};
global.analytics = {};

global.app.currentUser = function() {
  return {};
};

global.app.currentAnalyticsProduct = function() {
  return {};
};

global.analytics.track = function() {

};

global.parseUri = function() {
  return {};
};

global.keyMirror = function() {};

global.visibility = function() {};
global.Notify = function() {};
global.Notify.isSupported = function() { return true; };
global.Notify.needsPermission = function() { return true; };

global.pathToFile = function(name) {
  return '../../../../app/assets/javascripts/' + name;
};
