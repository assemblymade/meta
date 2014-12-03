var EventEmitter = require('events').EventEmitter
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _product = {}

class ProductStore extends EventEmitter {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_SET:
        console.log(action)
          _product = action.product
          break
      }
    })
  }

  getSlug() {
    return _product.slug
  }
}

var store = new ProductStore()

var dataTag = document.getElementById('ProductStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCT_SET,
    product: JSON.parse(dataTag.innerHTML)
  })
}

module.exports = store
