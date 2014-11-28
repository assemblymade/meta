// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes

var CommentActionCreators = {
  uploadAttachment: function(productSlug, attachmentUrl) {
    $.ajax({
      method: 'POST',
      url: '/' + productSlug + '/assets',
      data: {
        attachment_url: attachmentUrl
      },
      success: function() {
        Dispatcher.handleServerAction({
          type: ActionTypes.COMMENT_ATTACHMENT_UPLOADED,
          event: {
            eventId: attachmentUrl
          }
        });
      },
      error: function(jqXhr, textStatus, err) {
        Dispatcher.handleServerAction({
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
        Dispatcher.handleServerAction({
          type: ActionTypes.COMMENT_ATTACHMENT_UPLOADED,
          event: {
            eventId: eventId
          }
        });
      },
      error: function(jqXhr, textStatus, err) {
        Dispatcher.handleServerAction({
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
