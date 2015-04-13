var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var _partners = {}

class PartnersStore extends Store {

  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PARTNERS_RECEIVE:
          _setPartners(action.product, action.partners)
          this.emitChange()
          break;
      }
    })
  }

  get(productId) {
    return _partners[productId]
  }
}

module.exports = new PartnersStore()

function _setPartners(productId, partners) {
  _partners[productId] = partners.map((m) => { return {partner: m[0], coins: m[1]} })
}
