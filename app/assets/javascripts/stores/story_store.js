var Store = require('./es6_store')

var _dispatchToken,
    _stories = {}

var ActionTypes = window.CONSTANTS.ActionTypes;

class StoryStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {

    })
  }
}

var store = new StoryStore()

StoryActionCreators
