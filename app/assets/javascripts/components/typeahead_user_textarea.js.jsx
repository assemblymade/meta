(function(){
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

  var AttachmentsStore = require('../stores/attachments_store');
  var InPlaceUserSearch = require('./in_place_user_search.js.jsx');
  var UploadingAttachmentsStore = require('../stores/uploading_attachments_store');

  var TypeaheadUserTextArea = React.createClass({
    propTypes: {
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      required: React.PropTypes.oneOfType([
        React.PropTypes.bool,
        React.PropTypes.string
      ])
    },

    componentDidMount: function() {
      AttachmentsStore.on('change', this.getAttachment);
      AttachmentsStore.on('change', this.getError);
      UploadingAttachmentsStore.on('change', this.getUploadingAttachments);
    },

    getAttachment: function() {
      var attachment = AttachmentsStore.getAttachment();

      if (attachment) {
        var currentText = this.state.text || '';
        var newText = '![' + attachment.name + '](' + attachment.href + ')';
        var replaceText = '![Uploading... ' + attachment.name + ']()';

        var text = currentText.replace(replaceText, newText);

        this.setState({
          text: text
        });
      }
    },

    getError: function() {

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

    getInitialState: function() {
      return {
        text: this.props.defaultValue,
        username: null
      }
    },

    render: function() {
      return <InPlaceUserSearch
          username={this.state.usernameSearch}
          onUserChanged={this.handleUserChanged}
          onUserSelected={this.handleUserSelected}
          searchPosition="top">
        <textarea {...this.props} onChange={this.handleChange} value={this.state.text} />
      </InPlaceUserSearch>
    },

    handleChange: function(e) {
      var username = null
      var matches = e.target.value.match(USER_SEARCH_REGEX)
      if (matches) {
        username = matches.slice(-1)[0] || ''
      }

      this.setState({
        text: e.target.value,
        usernameSearch: username
      });
    },

    handleUserChanged: function(user) {
      if (user) {
        this.setState({text: this.replaceQueryWithUser(user)})
      }
    },

    handleUserSelected: function(user) {
      if (user) {
        this.setState({text: this.replaceQueryWithUser(user)})
      }

      this.setState({usernameSearch: null})
    },

    replaceQueryWithUser: function(user, suffix) {
      return this.state.text.replace(USER_SEARCH_REGEX, function(match, space, username, offset, string){
        return space + '@' + user.username + (suffix || '')
      })
    },
  })

  if (typeof module !== 'undefined') {
    module.exports = TypeaheadUserTextArea;
  }

  window.TypeaheadUserTextArea = TypeaheadUserTextArea;
})()
