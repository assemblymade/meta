(function(){
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

  var InPlaceUserSearch = require('./in_place_user_search.js.jsx')

  var getCaretCoords = require('../vendor/textarea_caret_coords');
  var getCaretPosition = require('../vendor/textarea_caret_position');

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
        usernameSearch: null,
        searchPosition: [0,0]
      }
    },

    render: function() {
      return <InPlaceUserSearch
          username={this.state.usernameSearch}
          onUserChanged={this.handleUserChanged}
          onUserSelected={this.handleUserSelected}
          searchPosition="bottom"
          coords={this.state.searchPosition}>
        <textarea {...this.props} onChange={this.handleChange} value={this.state.text} ref="textarea" />
      </InPlaceUserSearch>
    },

    handleChange: function(e) {
      var caretPosition = getCaretPosition(this.refs.textarea.getDOMNode())
      var textToCaret = e.target.value.substr(0, caretPosition)

      var newState = {
        text: e.target.value
      }

      var matches = textToCaret.match(USER_SEARCH_REGEX)
      if (matches) {
        newState.usernameSearch = matches.slice(-1)[0] || ''
        if (this.state.usernameSearch == null) {
          newState.searchPosition = this.findCaretCoords()
        }
      } else {
        newState.usernameSearch = null
      }

      this.setState(newState);

      // super
      if (this.props.onChange) {
        this.props.onChange(e);
      }
    },

    findCaretCoords: function() {
      var textarea = this.refs.textarea.getDOMNode();
      var coords = getCaretCoords(textarea, textarea.selectionEnd);
      return [coords.left - 14, coords.top + 16]
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
