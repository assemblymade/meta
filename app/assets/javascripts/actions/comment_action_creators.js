// var Dispatcher = require('../dispatcher')

if (typeof require !== 'undefined') {
  var CONSTANTS = require('../constants');
}

var ActionTypes = CONSTANTS.ActionTypes

var CommentActionCreators = {
  uploadAssets: function(productSlug, eventId) {
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
