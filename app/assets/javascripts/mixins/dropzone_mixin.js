var AttachmentActionCreators  = require('../actions/attachment_action_creators');
var AttachmentStore           = require('../stores/attachment_store');
var Dropzone                  = window.Dropzone;
var UploadingAttachmentsStore = require('../stores/uploading_attachments_store');

var DropzoneMixin = {
  initializeDropzone: function() {
    var attachmentUploadUrlTag = $('meta[name=attachment-upload-url]');

    this.dropzone = new Dropzone(this.getDOMNode(), {
      accept: this.onAccept,
      sending: this.onSending,
      url: attachmentUploadUrlTag && attachmentUploadUrlTag.attr('content')
    });

    this.dropzone.on('complete', this.onComplete);

    AttachmentStore.addChangeListener(this.getAttachment);
    UploadingAttachmentsStore.addChangeListener(this.getUploadingAttachments);
  },

  getAttachment: function() {
    var attachment = AttachmentStore.getAttachment();

    if (attachment) {
      var currentText = this.state.text || '';
      var newText = '![' + attachment.name + '](' + attachment.href + ')\n';
      var replaceText = '![Uploading... ' + attachment.name + ']()';

      var text = currentText.replace(replaceText, newText);

      this.setState({
        text: text
      });
    }
  },

  getUploadingAttachments: function() {
    var attachments = UploadingAttachmentsStore.getUploadingAttachments();

    if (attachments.length) {
      var newText = attachments.join(' ');
      var currentText = this.state.text || '';

      this.setState({
        text: currentText + newText
      });
    }
  },

  onAccept: AttachmentActionCreators.uploadAttachment,
  onComplete: AttachmentActionCreators.completeAttachmentUpload,
  onSending: function(file, xhr, formData) {
    _.each(file.form, function(v, k) {
      formData.append(k, v);
    });
  }
};

module.exports = DropzoneMixin;
