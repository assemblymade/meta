var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _posts = {}

class PostsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.POSTS_RECEIVE:
          _posts[action.product] = action.posts
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
  var data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.POSTS_RECEIVE,
    posts: data.posts,
    product: data.product
  })
}

module.exports = store
