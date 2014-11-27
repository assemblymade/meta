(function(){
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

  var TypeaheadUserTextArea = React.createClass({
    propTypes: {
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      required: React.PropTypes.oneOfType([
        React.PropTypes.bool,
        React.PropTypes.string
      ])
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
          searchPosition="bottom">
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
