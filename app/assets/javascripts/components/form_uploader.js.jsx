/** @jsx React.DOM */

(function() {
  var FormUploader = React.createClass({
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

    componentDidMount: function() {
      this.dropzone = new Dropzone(this.getDOMNode(), {
        url: this.props.url,
        accept: this.handleAccept,
        sending: this.handleSending,
        clickable: this.refs.select.getDOMNode()
      });
    },

    render: function() {
      return (
        <div className="dropzone-standalone">
          <div className="dropzone-inner" ref="select">
            {this.attachmentInputs()}
            To attach files drag &amp; drop here or <a href="javascript:;">select files
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

    handleAccept: function(file, done) {
      var attachment = new window.Attachment()
      attachment.save({
        name: file.name,
        content_type: file.type,
        size: file.size,
      }, {
        success: function(attachment) {
          this.updateState({
            attachments: { $push: [attachment.get('id')] }
          })
        }.bind(this)
      })
    },

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
})()
