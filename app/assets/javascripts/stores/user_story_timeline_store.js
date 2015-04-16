'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store')

let _stories = []
let _products = []
let _loading = false


class UserStoryTimelineStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.USER_STORIES_RECEIVE:
          _stories = action.stories
          _products = action.products
          _loading = false
          this.emitChange()
          break

        case ActionTypes.USER_STORIES_REQUEST:
          _loading = true
          this.emitChange()
          break
      }
    })
  }

  getStories() {
    return _stories
  }

  getProducts(){
    return _products
  }

  getLoading() {
    return _loading
  }


}

module.exports = new UserStoryTimelineStore;
