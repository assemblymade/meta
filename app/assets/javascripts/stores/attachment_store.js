var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var latestAttachment
var latestError

class AttachmentsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.ATTACHMENT_UPLOADED:
          latestAttachment = action.attachment
          this.emitChange()
          break

        case ActionTypes.ATTACHMENT_FAILED:
          latestError = action.error
          this.emitChange()
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
