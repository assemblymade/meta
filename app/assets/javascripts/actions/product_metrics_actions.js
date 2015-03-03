var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes')

module.exports = {
  productSelected: function(product) {
    $.ajax({
      type: "GET",
      url: routes.weekly_product_metrics_path({product_id: product.slug}),
      dataType: 'json',
      success: (data) =>
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_METRICS_RECEIVED,
          data: data
        })
    })
  },

  fetchWeeklies: function(product) {
    $.ajax({
      type: "GET",
      url: routes.weekly_product_metrics_path({product_id: product.slug}),
      dataType: 'json',
      success: (data) =>
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_METRICS_RECEIVED,
          data: data
        })
    })
  },

  fetchDailies: function(product) {
    $.ajax({
      type: "GET",
      url: routes.daily_product_metrics_path({product_id: product.slug}),
      dataType: 'json',
      success: (data) =>
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_METRICS_RECEIVED,
          data: data
        })
    })
  }

}
