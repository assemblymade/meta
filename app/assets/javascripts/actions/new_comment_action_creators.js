var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');

var NewCommentActionCreators = {
  updateComment: function(commentId, commentBody) {
    Dispatcher.dispatch({
      type: ActionTypes.NEW_COMMENT_UPDATED,
      commentId: commentId,
      commentBody: commentBody
    });
  }
};

module.exports = NewCommentActionCreators;
