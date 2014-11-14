/** @jsx React.DOM */

(function(){
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/
  var subscribing;

  var Set = require('Set');

  var ChatInput = React.createClass({
    propTypes: {
      room: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
      return {
        message: this.props.message || '',
        typingUsernames: []
      }
    },

    componentDidMount: function() {
      // grabbing a pusher channel outside of react. We can fix this when chat is all reactified
      subscribing = setInterval(this.subscribeToPresenceChannel, 50)
      $(this.refs.textarea.getDOMNode()).on('change', this.handleChange)
    },

    subscribeToPresenceChannel: function() {
      if (window.presenceChannel) {
        this.channel = window.presenceChannel
        this.channel.bind('client-typing', this.handleSomeoneTyping, this)
        clearInterval(subscribing)
      }
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (prevState.message === '' && this.state.message !== '') {
        this.addTyping(this.props.username)
      } else if (prevState.message !== '' && this.state.message === '') {
        this.removeTyping(this.props.username)
      }
    },

    addTyping: _.debounce(function(username) {
      this.updateTyping({ add: username })
    }, 500),

    removeTyping: _.debounce(function(username){
      this.updateTyping({ remove: username })
    }, 3000),

    updateTyping: function(op) {
      this.channel.trigger('client-typing', op)
    },

    handleSomeoneTyping: function(msg) {
      var usernames = new Set(this.state.typingUsernames)
      if (msg.add) {
        usernames.add(msg.add)
      } else {
        usernames.remove(msg.remove)
      }
      this.setState({typingUsernames: usernames.toArray()})
    },

    render: function() {
      var inputStyle = {
        overflow: "hidden",
        wordWrap: "break-word",
        resize: "none",
        height: "38px"
      };

      return <div id="comment">
        <InPlaceUserSearch
            url={this.props.searchUrl}
            username={this.state.usernameSearch}
            onUserChanged={this.handleUserChanged}
            onUserSelected={this.handleUserSelected}>
          <div className="js-markdown-editor js-dropzone">
            <textarea className="form-control" rows="1" style={inputStyle}
              ref="textarea"
              onKeyPress={this.onEnterKey(this.handleEnter)}
              onChange={this.handleChange} value={this.state.message} />
          </div>

          <ChatTypingLabel usernames={this.state.typingUsernames} />

        </InPlaceUserSearch>
      </div>
    },

    handleChange: function(e) {
      var username = null
      var matches = e.target.value.match(USER_SEARCH_REGEX)
      if (matches) {
        username = matches.slice(-1)[0] || ''
      }

      this.setState({
        message: e.target.value,
        usernameSearch: username
      });
    },

    handleUserChanged: function(user) {
      if (user) {
        this.setState({message: this.replaceQueryWithUser(user)})
      }
    },

    handleUserSelected: function(user) {
      if (user) {
        this.setState({message: this.replaceQueryWithUser(user)})
      }

      this.setState({usernameSearch: null})
    },

    replaceQueryWithUser: function(user, suffix) {
      return this.state.message.replace(USER_SEARCH_REGEX, function(match, space, username, offset, string){
        return space + '@' + user.username + (suffix || '')
      })
    },

    onEnterKey: function(fn) {
      var ENTER_KEY = 13

      return function(e) {
        e = e || window.event || {};
        var charCode = e.charCode || e.keyCode || e.which;
        if (!e.shiftKey && charCode == ENTER_KEY) {
          fn(e)
        }
      }
    },

    handleEnter: function(e) {
      e.preventDefault()

      var comment = new Comment({
        body: this.state.message
      })

      if (comment.isValid()) {
        this.submitComment(comment)
      }
    },

    submitComment: function(comment) {
      comment.url = this.props.url

      window.app.trigger('comment:scheduled', comment)
      this.setState({message: ''})
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = ChatInput
  }

  window.ChatInput = ChatInput
})()
