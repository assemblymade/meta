var ActionTypes = window.CONSTANTS.ActionTypes
var AttachmentStore = require('./attachment_store')
var NewsFeedItemStore = require('./news_feed_item_store')
var Store = require('./es6_store')

var _comments = {}

class NewCommentStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEW_COMMENT_UPDATED:
          updateComment(action.commentId, action.commentBody)
          this.emitChange()
          break
        case ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT:
          clearComment(action.commentId)
          this.emitChange()
          break
      }
    })
  }

  getComment(commentId) {
    return _comments[commentId] || ''
  }
}

module.exports = new NewCommentStore()

function clearComment(commentId) {
  _comments[commentId] = ''
}

function updateComment(commentId, comment) {
  _comments[commentId] = comment
}
