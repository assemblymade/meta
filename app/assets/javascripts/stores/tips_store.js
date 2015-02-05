var Store = require('./es6_store')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');

var _dispatchToken
var _tips = {}
var _userTips = {}

class TipsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.DISCUSSION_RECEIVE:
          _(action.comments).each(c => {
            _tips[c.id] = c.tips_total
          })
          _(action.userTips).each((coins, id) => {
            _userTips[id] = coins
          })
          this.emitChange()
          break
      }
    })
  }

  getTotalTip(id) {
    return _tips[id]
  }

  getUserTip(id) {
    return _userTips[id]
  }
}

module.exports = new TipsStore()
