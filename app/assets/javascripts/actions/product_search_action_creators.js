var ActionTypes = window.CONSTANTS.ActionTypes;

var ProductSearchActionCreators = {
  searchProducts: function(text) {

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCTS_SEARCH_INVALIDATE
    })

    var postData = {
      suggest_products: {
        text: text,
        completion: {
          field: 'suggest'
        }
      }
    };

    $.ajax({
      url: '/_es/products/_suggest',
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(postData),
      success: function(data) {
        var products = _.map(data.suggest_products[0].options, function(option) {
          return _.extend(option.payload, { query_text: option.text })
        })
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCTS_SEARCH_RECEIVE,
          products: products
        })
      }
    });
  }
};

module.exports = ProductSearchActionCreators;
