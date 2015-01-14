// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;
var UserStore = require('../stores/user_store');

var CommentActionCreators = {
  confirmUpdateReceived: function(commentId) {
    function confirm() {
      Dispatcher.dispatch({
        type: ActionTypes.COMMENT_UPDATE_RECEIVED,
        commentId: commentId
      });
    }

    if (Dispatcher.isDispatching()) {
      return setTimeout(confirm, 0);
    }

    confirm();
  },

  submitComment: function(commentId, commentBody, commentUrl) {
    var timestamp = Date.now();
    var user = UserStore.getUser();
    console.log(arguments);
    Dispatcher.dispatch({
      type: ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT,
      commentId: commentId,
      data: {
        body: commentBody,
        created_at: timestamp,
        news_feed_item_id: commentId,
        user: user
      }
    });

    window.analytics.track(
      'news_feed_item.commented', {
        product: (window.app.currentAnalyticsProduct())
      }
    );

    $.ajax({
      method: 'POST',
      url: commentUrl,
      json: true,
      data: { body: commentBody },
      success: function(comment) {
        Dispatcher.dispatch({
          type: ActionTypes.NEWS_FEED_ITEM_CONFIRM_COMMENT,
          data: {
            thread: commentId,
            timestamp: timestamp,
            comment: comment
          }
        });
      },
      error: function(jqXhr, textStatus, err) {
        // TODO: Handle errors -- maybe add a retry?
        console.log(err);
      }
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
