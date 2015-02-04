var Store = require('./es6_store')
var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');

var _dispatchToken
var _results = null


class ProductsSearchStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PRODUCTS_SEARCH_RECEIVE:
          _results = action.products
          break

        case ActionTypes.PRODUCTS_SEARCH_INVALIDATE:
          _results = null
          break

        default:
          return
      }

      this.emitChange()
    })
  }

  getResults() {
    return _results
  }
}

module.exports = new ProductsSearchStore()
