'use strict'

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
const Store = require('./es6_store')
const UserStore = require('./user_store')

var heartsCount = null
if (UserStore.getUser()) {
  heartsCount = UserStore.getUser().hearts_received
}

class HeartsReceivedStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.HEART_RECEIVED:
          heartsCount = action.data.heartsCount
          this.emitChange()
          break
      }
    })
  }

  getHeartsCount() {
    return heartsCount
  }
}

module.exports = new HeartsReceivedStore()
