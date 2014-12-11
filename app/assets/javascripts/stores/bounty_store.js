var ActionTypes = window.CONSTANTS.ActionTypes;
var Store = require('./es6_store');

var _dispatchToken
var _bounty = {}

class BountyStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.BOUNTY_WORK_SUBMITTED:
          _submitWork()
          this.emitChange()
          break
      }
    })
  }

  getState() {
    return _bounty.state
  }
}

module.exports = new BountyStore()

function _submitWork() {
  _bounty.state = 'reviewing'
}
