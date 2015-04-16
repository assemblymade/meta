'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store')

let _stories = []
let _loading = false
let _page = 1
let _pages = 1

class UserStoryTimelineStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.USER_STORIES_RECEIVE:
          _stories = action.stories
          _loading = false
          _page = action.page
          _pages = action.pages
          this.emitChange()
          break

        case ActionTypes.USER_STORIES_REQUEST:
          _loading = true
          this.emitChange()
          break
      }
    })
  }

  getStories(){
    return _stories
  }

  getPage(){
    return _page
  }

  getPages(){
    return _pages
  }

  getLoading() {
    return _loading
  }


}

module.exports = new UserStoryTimelineStore;
