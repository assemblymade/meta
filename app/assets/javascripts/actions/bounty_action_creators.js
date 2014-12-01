// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;

var BountyActionCreators = {
  call: function(e, eventName, url) {
    e.preventDefault();

    _track(eventName);
    _patch(url);
  }
};

function _patch(url) {
  // TODO: Dispatch success or error

  $.ajax({
    url: url,
    method: 'PATCH',
    headers: {
      'accept': 'application/json'
    },
    success: function(data) {},
    error: function(jqXhr, status, error) {
      console.error(error);
    }
  });
}

function _track(eventName) {
  var product = window.app.currentAnalyticsProduct();
  var user = window.app.currentUser();

  window.analytics.track(eventName, {
    product: (product ? product.attributes : {}),
    user: (user ? user.attributes : {})
  });
}

module.exports = BountyActionCreators;
