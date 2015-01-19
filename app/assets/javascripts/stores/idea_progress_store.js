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
        case ActionTypes.IDEAS_RECEIVE:
          _setInitialProgress(action.ideas)
          this.emitChange()
          break
        case ActionTypes.IDEA_RECEIVE:
          _setInitialProgress(action.idea)
          this.emitChange()
          break
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
    return currentIdeaProgress[id];
  }
}

module.exports = new IdeaProgressStore()

function _decrementIdeaProgress(heartableId) {
  if (currentIdeaProgress[heartableId]) {
    currentIdeaProgress[heartableId] -= INCREMENT;
  } else {
    currentIdeaProgress[heartableId] = INCREMENT;
  }
}

function _incrementIdeaProgress(heartableId) {
  if (currentIdeaProgress[heartableId]) {
    currentIdeaProgress[heartableId] += INCREMENT;
  } else {
    currentIdeaProgress[heartableId] = INCREMENT;
  }
}

function _setInitialProgress(ideas) {
  if (!(ideas instanceof Array)) {
    ideas = [ideas]
  }

  ideas.map((idea) => {
    var heartableId = idea.news_feed_item.id

    currentIdeaProgress[heartableId] = idea.temperature;
  });
}
