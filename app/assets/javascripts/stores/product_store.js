var Store = require('./es6_store')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');

var _dispatchToken
var _product = {}

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

  getName() {
    return _product.name
  }

  getProduct() {
    return _product
  }

  getSlug() {
    return _product.slug
  }

  getCoreTeamIds() {
    return _product.core_team || []
  }

  isCoreTeam(currentUser) {
    if (currentUser) {
      return this.getCoreTeamIds().indexOf(currentUser.id) > -1 ||
        currentUser.is_staff ||
        currentUser.staff ||
        currentUser.is_core;
    }

    return false;
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
