var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _lockedBounties = []
var _reviewingBounties = []

class UserBountiesStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.BOUNTIES_RECEIVE:
          _lockedBounties = action.lockedBounties
          _reviewingBounties = action.reviewingBounties
          this.emitChange()
          break
      }
    })
  }

  getLockedBounties() {
    return _lockedBounties
  }

  getReviewingBounties() {
    return _reviewingBounties
  }
}

var store = new UserBountiesStore()

var dataTag = document.getElementById('UserBountiesStore')
if (dataTag) {
  data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.BOUNTIES_RECEIVE,
    lockedBounties: data.lockedBounties,
    reviewingBounties: data.reviewingBounties,
  })
}

module.exports = store
