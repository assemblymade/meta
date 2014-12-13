var ActionTypes = window.CONSTANTS.ActionTypes;

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
