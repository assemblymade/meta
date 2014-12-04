var Store = require('./es6_store')
var ProductStore = require('./product_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _posts = {}

class PostsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.POSTS_RECEIVE:
          _posts[ProductStore.getSlug()] = action.posts
          break
      }
    })
  }

  getPosts(productSlug) {
    return _posts[productSlug] || []
  }
}

var store = new PostsStore()

var dataTag = document.getElementById('PostsStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.POSTS_RECEIVE,
    posts: JSON.parse(dataTag.innerHTML).posts
  })
}

module.exports = store
