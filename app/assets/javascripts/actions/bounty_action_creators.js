var ActionTypes = require('../constants').ActionTypes;
var BountiesStore = require('../stores/bounties_store.js');
var Dispatcher = require('../dispatcher');
var ProductStore = require('../stores/product_store.js');
var Routes = require('../routes');

var BountyActionCreators = {
  call: function(eventName, url) {
    _track(eventName);
    _patch(url);
  },

  assign: function(slug, wip_number, user_id) {
    _track('bounty.started')
    $.ajax({
      type: "PATCH",
      url: Routes.product_wip_assign_path({product_id: slug, wip_id: wip_number}),
      dataType: 'json',
      data: { assign_to_user_id: user_id }
    })
  },

  closeBounty: function(bountyId) {
    var url = Routes.product_wip_close_path({
      product_id: ProductStore.getSlug(),
      wip_id: bountyId
    });

    $.ajax({
      url: url,
      method: 'PATCH',
      headers: {
        accept: 'application/json'
      },
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.BOUNTY_CLOSED,
          bountyId: bountyId
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  },

  insertPlaceholder: function(index, height) {
    var bounties = BountiesStore.getBounties()
    var placeholder = {
      placeholder: true,
      height: height
    }

    bounties.splice(index, 0, placeholder)

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REORDER,
      bounties: bounties
    });
  },

  movePlaceholder: function(bountyId) {
    var bounties = BountiesStore.getBounties()

    var oldIndex = _.pluck(bounties, 'placeholder').indexOf(true)
    var placeholder = bounties[oldIndex]

    var newIndex = _.pluck(bounties, 'id').indexOf(bountyId)
    var bounty = bounties[newIndex]

    bounties[newIndex] = placeholder
    bounties[oldIndex] = bounty

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REORDER,
      bounties: bounties
    })
  },

  placeBounty: function(bounty) {
    var bounties = BountiesStore.getBounties();

    var oldIndex = bounties.indexOf(bounty);
    bounties.splice(oldIndex, 1)

    var newIndex = _.pluck(bounties, 'placeholder').indexOf(true)
    bounties.splice(newIndex, 1, bounty)

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REORDER,
      bounties: bounties
    })

    var above = bounties[newIndex + 1]
    var below = bounties[newIndex - 1]
    var data = { task: null }

    if(above) {
      data.task = { priority_above_id: above.id }
    } else {
      data.task = { priority_below_id: below.id }
    }

    var path = ['/', bounty.product_slug, '/', 'bounties', '/', bounty.number, '.', 'json'].join('');

    $.ajax({
      url: path,
      type: 'PATCH',
      dataType: 'json',
      data: data
    });
  },

  reopenBounty: function(bountyId) {
    var url = Routes.product_wip_reopen_path({
      product_id: ProductStore.getSlug(),
      wip_id: bountyId
    });

    $.ajax({
      url: url,
      method: 'PATCH',
      headers: {
        accept: 'application/json'
      },
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.BOUNTY_REOPENED,
          bountyId: bountyId
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  },

  requestBounties: function(productSlug, params) {
    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REQUEST,
      bounties: []
    });

    var path = ['/', productSlug, '/', 'bounties', '.', 'json'].join('');

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
        });
      }
    });
  },

  requestBountiesDebounced: _.debounce(function(productSlug, params) {
    this.requestBounties(productSlug, params);
  }, 300),

  requestNextPage: function(productSlug, params) {
    var loading = BountiesStore.getLoading()
    var page = BountiesStore.getPage()
    var pages = BountiesStore.getPages()

    if (loading || page == pages) {
      return
    }

    var bounties = BountiesStore.getBounties()

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REQUEST,
      bounties: bounties
    });

    var path = ['/', productSlug, '/', 'bounties', '.', 'json'].join('');
    params['page'] = page + 1

    $.ajax({
      url: path,
      type: 'GET',
      dataType: 'json',
      data: params,
      success: function(response) {
        Dispatcher.dispatch({
          type: ActionTypes.BOUNTIES_RECEIVE,
          bounties: bounties.concat(response.bounties),
          page: response.meta.pagination.page,
          pages: response.meta.pagination.pages
        });
      }
    });
  },

  submitWork: function(url) {
    _patch(url);

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTY_WORK_SUBMITTED
    });
  }
};

function _patch(url, data) {
  _request('PATCH', url, (data || {}));
}

function _post(url, data) {
  _request('POST', url, (data || {}));
}

function _request(method, url, data) {
  // TODO: Dispatch success or error

  if (!data) {
    data = {};
  }

  $.ajax({
    url: url,
    method: method,
    data: data,
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
