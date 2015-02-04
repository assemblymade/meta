var Store = require('./es6_store')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var NewCommentStore = require('./new_comment_store')
var UploadingAttachmentsStore = require('./uploading_attachments_store')

var _attachments = {}
var _errors = {}

class AttachmentsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.ATTACHMENT_UPLOADED:
          setAttachment(action)

          this.emitChange()
          break

        case ActionTypes.ATTACHMENT_FAILED:
          setError(action)

          this.emitChange()
          break
      }
    })
  }

  getAttachment(commentId) {
    var attachment = _.clone(_attachments[commentId])
    _attachments[commentId] = null

    return attachment
  }

  getError(commentId) {
    var error = _.clone(_errors[commentId])
    _errors[commentId] = null

    return error
  }
}

function setAttachment(action) {
  var commentId = action.commentId
  var attachment = action.attachment

  _attachments[commentId] = attachment
}

function setError(action) {
  var commentId = action.commentId
  var error = action.error

  _errors[commentId] = error
}

module.exports = new AttachmentsStore()
