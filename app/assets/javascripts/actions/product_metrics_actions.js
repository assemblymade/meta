var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes')

module.exports = {
  fetchDailies: function(product) {
    _getAndDispatch(
      routes.daily_product_metrics_path({product_id: product.slug}),
      ActionTypes.PRODUCT_METRICS_RECEIVED
    )
  }
}

function _getAndDispatch(url, actionType) {
  $.ajax({
    type: "GET",
    url: url,
    dataType: 'json',
    success: (data) => {
      Dispatcher.dispatch({
        type: actionType,
        data: data
      })
    }
  })
}
