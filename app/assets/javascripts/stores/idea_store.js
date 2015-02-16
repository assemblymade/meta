var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var currentIdea = {}

class IdeaStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.IDEA_RECEIVE:
        case ActionTypes.IDEAS_NEW_IDEA_CREATED:
        case ActionTypes.IDEA_UPDATED:
          _setIdea(action)
          this.emitChange()
          break
        case ActionTypes.LOVE_CLICKED:
          _incrementHearts(action)
          this.emitChange()
          break
        case ActionTypes.LOVE_UNCLICKED:
          _decrementHearts(action)
          this.emitChange()
          break
      }
    })
  }

  getIdea() {
    return currentIdea
  }
}

module.exports = new IdeaStore()

function _decrementHearts(action) {
  if (currentIdea.news_feed_item &&
      currentIdea.news_feed_item.id === action.heartable_id) {
    currentIdea.hearts_count--;
  }
}

function _incrementHearts(action) {
  if (currentIdea.news_feed_item &&
      currentIdea.news_feed_item.id === action.heartable_id) {
    currentIdea.hearts_count++;
  }
}

function _setIdea(action) {
  currentIdea = action.idea
}
