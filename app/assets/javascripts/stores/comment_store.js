var ActionTypes = window.CONSTANTS.ActionTypes
var Store = require('./es6_store')

var _dispatchToken
var _comment

class CommentStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.COMMENT_UPDATED:
          setComment(action.comment);
          this.emitChange()
          break
        case ActionTypes.COMMENTED_UPDATE_RECEIEVED:
          unsetComment(action.commentId)
          break
      }
    })
  }

  getComment(id) {
    if (_comment && _comment.id === id) {
      return _comment
    }
  }
}

module.exports = new CommentStore()

function setComment(comment) {
  _comment = comment
  console.log('set to', comment)
}

function unsetComment(commentId) {
  if (_comment && _comment.id === commentId) {
    _comment = null
  }
}
