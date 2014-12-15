// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes
var ProductStore = require('../stores/product_store')
var uploadUrl = '/upload/attachments'

class AttachmentActionCreators {
  uploadAttachment(commentId) {
    return function(file, done) {
      _upload(commentId, file, done)
    }
  }
}

function _upload(commentId, file, done) {
  Dispatcher.dispatch({
    type: ActionTypes.ATTACHMENT_UPLOADING,
    commentId: commentId,
    text: '![Uploading... ' + file.name + ']()'
  })

  $.ajax({
    url: uploadUrl,
    method: 'POST',
    dataType: 'json',
    data: {
      name: file.name,
      content_type: file.type,
      size: file.size
    },
    success: function(attachment) {
      file.attachment = attachment
      file.form = attachment.form

      Dispatcher.dispatch({
        commentId: commentId,
        type: ActionTypes.ATTACHMENT_UPLOADED,
        attachment: attachment
      })

      done()
    },
    error: function(jqXhr, textStatus, err) {
      Dispatcher.dispatch({
        commentId: commentId,
        type: ActionTypes.ATTACHMENT_FAILED,
        error: err
      })

      done()
    }
  });
}

module.exports = new AttachmentActionCreators()
