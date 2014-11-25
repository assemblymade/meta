global.React = require('react/addons');
global.TestUtils = React.addons.TestUtils;
global.path = require.requireActual('path');
global._ = require('underscore');
global.$ = require('jquery');
global.$.timeago = function() {};
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

// these are currently pulled in via sprockets, so we'll auto require them here
global.Constants = require('../../app/assets/javascripts/constants')
global.Dispatcher = require('../../app/assets/javascripts/dispatcher')
