var AttachmentActionCreators = require('../actions/attachment_action_creators');
var AttachmentStore = require('../stores/attachment_store');

var FormUploader = React.createClass({
  componentDidMount: function() {
    this.dropzone = new Dropzone(this.getDOMNode(), {
      url: this.props.url,
      accept: this.handleAccept(this.props.inputId),
      sending: this.handleSending,
      clickable: this.refs.select.getDOMNode()
    });

    AttachmentStore.addChangeListener(this.getAttachment);
  },

  getAttachment: function() {
    var attachment = AttachmentStore.getAttachment(this.props.inputId);

    this.updateState({
      attachments: { $push: [attachment.id] }
    });
  },

  getDefaultProps: function() {
    return {
      inputName: 'attachment',
      url: $('meta[name=attachment-upload-url]').attr('content')
    }
  },

  getInitialState: function() {
    return {
      attachments: []
    }
  },

  render: function() {
    return (
      <div className="dropzone-standalone">
        <div className="dropzone-inner" ref="select">
          {this.attachmentInputs()}
          To attach files drag &amp; drop here or <a href="javascript:void(0 );">select files
          from your computer</a>...
        </div>
      </div>
    );
  },

  attachmentInputs: function() {
    return this.state.attachments.map(function(attachmentId) {
      return <input name={this.props.inputName} type="hidden" value={attachmentId} />
    }.bind(this))
  },

  handleAccept: AttachmentActionCreators.uploadAttachment,

  updateState: function(update) {
    this.setState(React.addons.update(this.state, update))
  },

  handleSending: function(file, xhr, formData) {
    for (var key in file.form) {
      if (file.form.hasOwnProperty(key)) {
        formData.append(key, file.form[key])
      }
    }
  }
})

if (typeof module !== 'undefined') {
  module.exports = FormUploader
}

window.FormUploader = FormUploader
