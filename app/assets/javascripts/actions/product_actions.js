var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

module.exports = {
  followClicked: function(product_id) {
    dispatch(product_id, ActionTypes.PRODUCT_FOLLOW_CLICKED)

    $.ajax({
           url: routes.product_follow_path({product_id: product_id}),
          type: 'POST',
      dataType: 'json',
       success: dispatch.bind(null, product_id, ActionTypes.PRODUCT_FOLLOW_SUCCEEDED),
         error: dispatch.bind(null, product_id, ActionTypes.PRODUCT_FOLLOW_FAILED)
    })
  },

  unfollowClicked: function(product_id) {
    dispatch(product_id, ActionTypes.PRODUCT_UNFOLLOW_CLICKED)

    $.ajax({
           url: routes.product_unfollow_path({product_id: product_id}),
          type: 'POST',
      dataType: 'json',
       success: dispatch.bind(null, product_id, ActionTypes.PRODUCT_UNFOLLOW_SUCCEEDED),
         error: dispatch.bind(null, product_id, ActionTypes.PRODUCT_UNFOLLOW_FAILED)
    })
  },

  changeTab: function(tabName) {
    setTimeout(()=>
      Dispatcher.dispatch({
        type: ActionTypes.PRODUCT_HEADER_ACTIVE_TAB_CHANGE,
        activeTab: tabName
      }), 1)
  }
}

function dispatch(product_id, type) {
  Dispatcher.dispatch({
    type: type,
    product_id: product_id
  })
}
