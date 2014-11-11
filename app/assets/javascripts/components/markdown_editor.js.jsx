/** @jsx React.DOM */

(function(){
  var MarkdownEditor = React.createClass({
    propTypes: {
      id: React.PropTypes.string,
      name: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
      var attachmentUploadUrlTag = $('meta[name=attachment-upload-url]');

      if (attachmentUploadUrlTag) {
        return {
          url: attachmentUploadUrlTag.attr('content')
        };
      }

      console.warn('No attachment upload URL was found. Attachments might fail to upload.');

      return {};
    },

    componentDidMount: function() {
      // TODO: move this garbage to React
      dzView = new DropzoneView({el: this.getDOMNode(), url: this.props.url, selectEl: this.refs.file.getDOMNode() })
      new MarkdownEditorView({el: this.getDOMNode(), dropzone: dzView.dz})
    },

    render: function() {
      return <div className="markdown-editor-control dropzone">
        <textarea name={this.props.name} className="form-control" rows="4" id={this.props.id || 'markdown-editor'} style={{'height': '176px'}} required={this.props.required || "false"}></textarea>
        <div className="dropzone-inner">
          To attach files drag &amp; drop here or&nbsp;
          <a className="clickable" ref="file">select files from your computer</a>...
        </div>
      </div>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = MarkdownEditor
  }

  window.MarkdownEditor = MarkdownEditor
})()
