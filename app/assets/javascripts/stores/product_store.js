var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Immutable = require('immutable');
var Store = require('./es6_store');

var _dispatchToken
var _product = Immutable.Map({});

class ProductStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.INTRODUCTION_RECEIVE:
          _product.set('is_member', true);
          this.emitChange()
          break
        case ActionTypes.PRODUCT_RECEIVE:
          _product = Immutable.Map(action.product);
          this.emitChange()
          break
      }
    })
  }

  getName() {
    return _product.get('name');
  }

  getProduct() {
    // return the raw JS object for now
    return (_product && _product.toJS()) || {};
  }

  getSlug() {
    return _product.get('slug');
  }

  getCoreTeamIds() {
    var product = _product && _product.toJS()
    return (product && product.core_team) || []
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
