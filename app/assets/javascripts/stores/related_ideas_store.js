var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var currentRelatedIdeas = []

class RelatedIdeasStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.RELATED_IDEAS_RECEIVE:
          _setRelatedIdea(action)
          this.emitChange()
          break
        }
      })
    }

    getRelatedIdeas() {
      return currentRelatedIdeas
    }
  }

  module.exports = new RelatedIdeasStore()

  function _setRelatedIdea(action) {
    currentRelatedIdeas = action.relatedIdeas || []
  }
