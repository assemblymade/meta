var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _product = null

class ProductStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_RECEIVE:
          _product = action.product
          this.emitChange()
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

  getCoreTeamIds() {
    return _product.core_team
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
