// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;
var url = '/upload/attachments';

class AttachmentActionCreators {
  uploadAttachment(file) {
    _upload(file)
  }
}

function _upload(file) {
  Dispatcher.dispatch({
    type: ActionTypes.ATTACHMENT_UPLOADING,
    text: '![Uploading... ' + file.name + ']()'
  })

  $.ajax({
    url: url,
    method: 'POST',
    dataType: 'json',
    data: {
      name: file.name,
      content_type: file.type,
      size: file.size
    },
    success: function(data) {
      Dispatcher.dispatch({
        type: ActionTypes.ATTACHMENT_UPLOADED,
        data: data
      });
    },
    error: function(jqXhr, textStatus, err) {
      Dispatcher.dispatch({
        type: ActionTypes.ATTACHMENT_FAILED,
        error: err
      });
    }
  });
}

module.exports = new AttachmentActionCreators()
