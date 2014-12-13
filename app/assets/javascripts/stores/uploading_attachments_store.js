var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _currentAttachments = {}

class UploadingAttachmentsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.ATTACHMENT_UPLOADING:
          _addAttachment(action)

          this.emitChange()
          break
      }
    })
  }

  getUploadingAttachments(commentId) {
    var attachments = _.clone(_currentAttachments[commentId]) || []
    _currentAttachments[commentId] = []

    return attachments
  }
}

function _addAttachment(action) {
  var text = action.text
  var commentId = action.commentId

  if (text) {
    if (_currentAttachments[commentId]) {
      _currentAttachments[commentId].push(text)
    } else {
      _currentAttachments[commentId] = [text]
    }
  }
}

module.exports = new UploadingAttachmentsStore()
