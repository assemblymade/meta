var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var INCREMENT = 1;

var currentIdeaProgress = {}

class IdeaProgressStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.LOVE_RECEIVE_USER_HEARTS:
          _setUserHearts(action.userHearts);
          this.emitChange();
          break;
        case ActionTypes.LOVE_CLICKED:
          _incrementIdeaProgress(action.heartable_id)
          this.emitChange()
          break
        case ActionTypes.LOVE_UNCLICKED:
          _decrementIdeaProgress(action.heartable_id)
          this.emitChange()
          break
      }
    })
  }

  getProgress(id) {
    return currentIdeaProgress[id] || 0;
  }
}

module.exports = new IdeaProgressStore();

function _decrementIdeaProgress(heartableId) {
  if (typeof currentIdeaProgress[heartableId] === 'undefined') {
    currentIdeaProgress[heartableId] = 0;
  }

  currentIdeaProgress[heartableId] -= INCREMENT;
}

function _incrementIdeaProgress(heartableId) {
  if (typeof currentIdeaProgress[heartableId] === 'undefined') {
    currentIdeaProgress[heartableId] = 0;
  }

  currentIdeaProgress[heartableId] += INCREMENT;
}

function _setUserHearts(userHearts) {
  if (userHearts && userHearts.length) {
    userHearts.forEach((heart) => {
      currentIdeaProgress[heart.heartable_id] = 0;
    });
  }
}
