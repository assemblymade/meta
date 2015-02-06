var Store = require('./es6_store')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');

var _dispatchToken
var _posts = []

class PostsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.POSTS_RECEIVE:
          _posts = action.posts
          this.emitChange()
          break
      }
    })
  }

  getPosts() {
    return _posts
  }
}

var store = new PostsStore()

var dataTag = document.getElementById('PostsStore')
if (dataTag) {
  var data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.POSTS_RECEIVE,
    posts: data.posts
  });
}

module.exports = store
