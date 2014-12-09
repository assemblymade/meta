var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _currentAttachments = []

class UploadingAttachmentsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.ATTACHMENT_UPLOADING:
          _addAttachment(action)

          this.emitChange()
          break
      }
    })
  }

  getUploadingAttachments() {
    var attachments = _currentAttachments
    _currentAttachments = []

    return attachments
  }
}

function _addAttachment(action) {
  var text = action.text

  if (text) {
    _currentAttachments.push(text)
  }
}

module.exports = new UploadingAttachmentsStore()
