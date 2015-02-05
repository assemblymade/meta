var Store = require('./es6_store')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');

var _dispatchToken
var _products = []

class ProductsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCTS_RECEIVE:
          _products = action.products
          this.emitChange()
          break
      }
    })
  }

  getProducts() {
    return _products
  }
}

var store = new ProductsStore()

var dataTag = document.getElementById('ProductsStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCTS_RECEIVE,
    products: JSON.parse(dataTag.innerHTML)
  })
}

module.exports = store
