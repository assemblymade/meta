// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;

var BountyActionCreators = {
  call: function(e, eventName, url) {
    e.preventDefault();

    _track(eventName);
    _patch(url);
  },

  requestBounties: function(productSlug, params) {
    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REQUEST,
      bounties: []
    })

    var path = ['/', productSlug, '/', 'bounties', '.', 'json'].join('')

    $.ajax({
      url: path,
      type: 'GET',
      dataType: 'json',
      data: params,
      success: function(response) {
        Dispatcher.dispatch({
          type: ActionTypes.BOUNTIES_RECEIVE,
          bounties: response.bounties,
          page: response.meta.pagination.page,
          pages: response.meta.pagination.pages
        })
      }
    })
  },

  requestBountiesDebounced: _.debounce(function(productSlug, params) {
    this.requestBounties(productSlug, params)
  }, 300),
};

function _patch(url) {
  _request('PATCH', url);
}

function _request(method, url) {
  // TODO: Dispatch success or error

  $.ajax({
    url: url,
    method: method,
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
