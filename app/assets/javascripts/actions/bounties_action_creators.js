var ActionTypes = window.CONSTANTS.ActionTypes

var _timeout = null

BountiesActionCreators = {
  requestBountiesThrottled: function(product, params) {
    if(_timeout) {
      clearTimeout(_timeout)
    }

    _timeout = setTimeout(function() {
      this.requestBounties(product, params)
    }.bind(this), 300)
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
  }
}

module.exports = BountiesActionCreators
