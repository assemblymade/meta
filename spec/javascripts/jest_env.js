// path helpers to make it easier to require files in app/assets
global.appPath = require.requireActual('path').resolve(__dirname, '../../app/assets/javascripts')
global.pathToFile = function(name) {
  return appPath + '/' + name;
};
global.appFile = pathToFile;

// global requires, assumed present for a lot of javascript files
global._ = require('underscore');
global.$ = require('jquery');

global.React = require('react/addons');
global.TestUtils = React.addons.TestUtils;

// stub out other methods relied on
// TODO: these should probably be moved into individual test cases
global.parseUri = function() {
  return {};
};

global.$.timeago = function() {};
global.app = {};
global.analytics = {};

global.app.currentUser = function() {
  return {};
};

global.app.currentAnalyticsProduct = function() {
  return {};
};
global.app.featureEnabled = function() {
  return true
}
global.analytics.track = function() {};

global.visibility = function() {};
global.Notify = function() {};
global.Notify.isSupported = function() { return true; };
global.Notify.needsPermission = function() { return true; };

global.ZeroClipboard = function() {
  return {
    on: function() {}
  };
};
