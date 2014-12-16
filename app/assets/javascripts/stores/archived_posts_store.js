var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes
var PostsStore = require('./posts_store')

var _dispatchToken
var _archivedPosts = {}

class ArchivedPostsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.POST_ARCHIVED:
          _archivedPosts[action.postId] = 1
          this.emitChange()
          break
        case ActionTypes.POST_UNARCHIVED:
          _archivedPosts[action.postId] = 0;
          this.emitChange()
          break
      }
    })
  }

  isArchived(postId) {
    return _archivedPosts[postId] === 1 ? true : false
  }
}

console.log(PostsStore.getPosts('buckets'));

module.exports = new ArchivedPostsStore()
