'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store')

let _stories;

class StoryTimelineStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PRODUCT_STORIES_RECEIVE:
          _stories = action.stories
          this.emitChange()
          break
      }
    })
  }

  fetchStories(){
    return _stories
  }

}

module.exports = new StoryTimelineStore;
