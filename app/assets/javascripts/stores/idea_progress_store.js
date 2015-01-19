var CONSTANTS = window.CONSTANTS // require('../constants')
var ActionTypes = CONSTANTS.ActionTypes
var Store = require('./es6_store')

var INCREMENT = 3;

var currentIdeaProgress = {}

class IdeaProgressStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.LOVE_CLICKED:
          _incrementIdeaProgress(action.heartable_id)
          this.emitChange()
          break
        case ActionTypes.LOVE_UNCLICKED:
          _decrementIdeaProgress(action.heartable_id)
          this.emitChange()
          // we need to reset progress to 0 so that
          // components don't keep decrementing when
          // other components' actions are triggered
          _resetIdeaProgress(action.heartable_id);
          break
      }
    })
  }

  getProgress(id) {
    return currentIdeaProgress[id] || 0;
  }
}

module.exports = new IdeaProgressStore()

function _decrementIdeaProgress(heartableId) {
  currentIdeaProgress[heartableId] = -INCREMENT;
}

function _incrementIdeaProgress(heartableId) {
  currentIdeaProgress[heartableId] = INCREMENT;
}

function _resetIdeaProgress(heartableId) {
  currentIdeaProgress[heartableId] = 0;
}
