'use strict'

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
const Store = require('./es6_store')
const UserStore = require('./user_store')

var awards = null
var coins = null
var totals = null

class HeartsReceivedStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.AWARDS_RECEIVE:
          awards = action.awards
          coins = action.coins
          totals = action.totals
          this.emitChange()
          break
      }
    })
  }

  getAwards() {
    return awards
  }

  getCoins(productId) {
    return coins[productId]
  }

  getTotal(productId) {
    return totals[productId]
  }
}

module.exports = new HeartsReceivedStore()
