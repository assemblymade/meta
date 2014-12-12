// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes

var CommentActionCreators = {
  confirmUpdateReceived: function(commentId) {
    Dispatcher.dispatch({
      type: ActionTypes.COMMENT_UPDATE_RECEIVED,
      commentId: commentId
    });
  },

  updateComment: function(commentId, commentBody, commentUrl) {
    var data = JSON.stringify({
      comment: {
        body: commentBody
      }
    });

    $.ajax({
      method: 'PATCH',
      url: commentUrl,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      data: data,
      success: function(comment) {
        Dispatcher.dispatch({
          type: ActionTypes.COMMENT_UPDATED,
          comment: comment
        });
      },
      error: function(jqXhr, textStatus, err) {
        Dispatcher.dispatch({
          type: ActionTypes.COMMENT_UPDATE_FAILED,
          error: err
        });
      }
    });
  },

  uploadAttachment: function(productSlug, attachmentUrl) {
    $.ajax({
      method: 'POST',
      url: '/' + productSlug + '/assets',
      data: {
        attachment_url: attachmentUrl
      },
      success: function() {
        Dispatcher.dispatch({
          type: ActionTypes.COMMENT_ATTACHMENT_UPLOADED,
          event: {
            eventId: attachmentUrl
          }
        });
      },
      error: function(jqXhr, textStatus, err) {
        Dispatcher.dispatch({
          type: ActionTypes.COMMENT_ATTACHMENT_FAILED,
          event: {
            error: err,
            eventId: attachmentUrl
          }
        });
      }
    });
  },

  uploadAllEventAssets: function(productSlug, eventId) {
    $.ajax({
      method: 'POST',
      url: '/' + productSlug + '/assets',
      data: {
        event_id: eventId
      },
      success: function() {
        Dispatcher.dispatch({
          type: ActionTypes.COMMENT_ATTACHMENT_UPLOADED,
          event: {
            eventId: eventId
          }
        });
      },
      error: function(jqXhr, textStatus, err) {
        Dispatcher.dispatch({
          type: ActionTypes.COMMENT_ATTACHMENT_FAILED,
          event: {
            error: err,
            eventId: eventId
          }
        });
      }
    });
  }
};

module.exports = CommentActionCreators;
