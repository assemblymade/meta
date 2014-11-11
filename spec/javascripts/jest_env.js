global.React = require('react/addons');
global.TestUtils = React.addons.TestUtils;
global._ = require('underscore');
global.$ = require('jquery');
global.app = {};
global.app.currentUser = function() {
  return {};
};
global.visibility = function() {};
global.Notify = function() {};
global.Notify.isSupported = function() { return true; };
global.Notify.needsPermission = function() { return true; };

global.pathToFile = function(name) {
  return '../../../../app/assets/javascripts/' + name;
};
