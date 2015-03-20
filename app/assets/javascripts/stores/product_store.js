var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var {Map, List} = require('immutable');
var Store = require('./es6_store');

var _dispatchToken
var _product = Map({});

class ProductStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.INTRODUCTION_RECEIVE:
          _product = _product.set('is_member', true);
          this.emitChange()
          break
        case ActionTypes.PRODUCT_RECEIVE:
          _product = Map(action.product);
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
    return List(
        _product.get('core_team')
      ).map(u => u.id)
  }

  isCoreTeam(user) {
    return user &&
      this.getCoreTeamIds().contains(user.id)
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
