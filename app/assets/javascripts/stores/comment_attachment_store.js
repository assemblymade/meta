// var Dispatcher = require('../dispatcher')
var Store = require('./store');
var ActionTypes = window.CONSTANTS.ActionTypes;

var _dispatchToken;
var _initialAttachments = _parseInitialAttachments() || {};
var _attachments = {};
var _errors = {};

var CommentAttachmentStore = _.extend(Object.create(Store), {
  /**
   * Retrieve the attachments associated with the calling component
   * @param  {String} reactId   The component's name
   * @return {String[] | []}    An array of attachment IDs or an empty array
   */
  getAttachments: function(reactId) {
    return _attachments[reactId] || [];
  },

  getErrors: function(eventId) {
    return _errors[eventId] || [];
  },

  attachmentBelongsToProduct: function(attachmentUrl) {
    attachmentPath = parseUri(attachmentUrl).path;

    if (attachmentPath) {
      return !!_initialAttachments[decodeURI(attachmentPath.slice(1))];
    }

    return false;
  }
});

_dispatchToken = Dispatcher.register(function(action) {
  switch(action.type) {
  // COMMENT_ATTACHMENT_ADDED can't be used while we're manipulating the DOM
  // directly in dropzone_view.js.coffee -- it causes really strange conflicts
  // between the browser DOM and React's shadow DOM
  case ActionTypes.COMMENT_ATTACHMENT_ADDED:
    addAttachment(action.event);

    this.emitChange();
    break;
  case ActionTypes.COMMENT_ATTACHMENT_FAILED:
    addError(action.event);

    this.emitChange();
    break;
  case ActionTypes.COMMENT_ATTACHMENT_UPLOADED:
    clearErrors(action.event);

    this.emitChange();
    break;
  // since we aren'te using COMMENT_ATTACHMENT_ADDED we don't need
  // to respond to WIP_EVENT_CREATING; this won't be called
  case ActionTypes.WIP_EVENT_CREATING:
    removeAttachments();

    this.emitChange();
    break;

  }
}.bind(CommentAttachmentStore));

function addAttachment(event) {
  var attachmentId = event.attachmentId;
  var reactId = event.reactId;

  if (_attachments[reactId]) {
    _attachments[reactId].push(attachmentId);
  } else {
    _attachments[reactId] = [attachmentId];
  }
}

function addError(event) {
  var eventId = event.eventId;
  var eventError = event.error;

  if (_errors[eventId]) {
    _errors[eventId].push(eventError);
  } else {
    _errors[eventId] = [eventError];
  }
}

function clearErrors(event) {
  _errors[event.eventId] = [];
}

function removeAttachments() {
  // Obliterating the _attachments object is admittedly a terrible
  // idea under normal circumstances, but see discussion_view.coffee:
  // there's an expectation of one #event_comment_body element, so
  // for now, this reset will work harmoniously with that implementation
  _attachments = {};
}

function _parseInitialAttachments() {
  var productAssetsTag = document.getElementById('product_assets');

  if (productAssetsTag) {
    var productAssets;

    try {
      productAssets = JSON.parse(productAssetsTag.innerHTML);
    } catch (e) {
      return {};
    }

    return productAssets;
  }
}

module.exports = CommentAttachmentStore;
