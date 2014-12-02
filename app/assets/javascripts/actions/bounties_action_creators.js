var ActionTypes = window.CONSTANTS.ActionTypes

BountiesActionCreators = {
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
  requestBountiesDebounced: _.debounce(this.requestBounties, 300),
}

module.exports = BountiesActionCreators
