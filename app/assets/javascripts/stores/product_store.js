var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _product = {}

class ProductStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_RECEIVE:
          _product = action.product
          break
      }
    })
  }

  getProduct() {
    return _product
  }

  getSlug() {
    return _product.slug
  }
}

var store = new ProductStore()

var dataTag = document.getElementById('ProductStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCT_RECEIVE,
    product: JSON.parse(dataTag.innerHTML)
  })
}

module.exports = store
