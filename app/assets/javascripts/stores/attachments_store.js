var EventEmitter = require('events').EventEmitter
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var latestAttachment
var latestError

class AttachmentsStore extends EventEmitter {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.ATTACHMENT_UPLOADED:
          latestAttachment = action.attachment
          this.emit('change')
          break

        case ActionTypes.ATTACHMENT_FAILED:
          latestError = action.error
          this.emit('change')
          break
      }
    })
  }

  getAttachment() {
    var attachment = latestAttachment
    latestAttachment = null

    return attachment
  }

  getError() {
    var error = latestError
    latestError = null

    return error
  }
}

module.exports = new AttachmentsStore()
