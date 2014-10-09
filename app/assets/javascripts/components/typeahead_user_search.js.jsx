/** @jsx React.DOM */

(function(){
  var keys = {
    enter: 13,
    esc: 27,
    tab: 9,
    up: 38,
    down: 40
  }

  var TypeaheadUserSearch = React.createClass({
    propTypes: {
      username: React.PropTypes.string
    },

    getInitialState: function() {
      return {
        users: [],
        highlightIndex: 0
      }
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (this.props.username && (prevProps.username != this.props.username)) {
        this.searchUsers(this.props.username)
      }
    },

    render: function() {
      return <div id="comment" style={{"position":"relative"}} onKeyDown={this.handleKeyDown}>
        {this.shouldShowUserList() ? <UserPicker
          users={this.state.users}
          highlightIndex={this.state.highlightIndex}
          onUserSelected={this.handleUserSelected} /> : null}

        {this.props.children}
      </div>
    },

    shouldShowUserList: function() {
      return this.props.username != null
    },

    searchUsers: function(text) {
      var postData = {
        suggest_username: {
          text: text,
          completion: {
            field: 'suggest_username'
          }
        }
      };

      $.ajax({
        url: this.props.url + '/users/_suggest',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(postData),
        success: function(data) {
          var users = _.map(data.suggest_username[0].options, function(option) {
            return _.extend(option.payload, { username: option.text })
          })
          var index = this.constrainHighlight(this.state.highlightIndex)
          this.setState({users: users, highlightIndex: index})
        }.bind(this),
        error: function(xhr, status, err) {
          console.error('error', arguments)
        }.bind(this)
      });
    },

    handleKeyDown: function(e) {
      if (!this.shouldShowUserList()) {
        return
      }

      var charCode = e.charCode || e.keyCode || e.which;
      if (charCode == keys.up) {
        e.preventDefault()
        this.moveHighlight(-1)
      } else if (charCode == keys.down) {
        e.preventDefault()
        this.moveHighlight(1)
      } else if (charCode == keys.enter || charCode == keys.tab) {
        e.preventDefault()
        this.selectCurrentUser()
      } else if (charCode == keys.esc) {
        e.preventDefault()
        this.props.onUserSelected(null)
      }
    },

    moveHighlight: function(inc) {
      var index = this.constrainHighlight(this.state.highlightIndex + inc)
      this.props.onUserChanged(this.state.users[index])
      this.setState({ highlightIndex: index })
    },

    selectCurrentUser: function() {
      this.props.onUserSelected(this.state.users[this.state.highlightIndex])

      if (this.state.users.length > 0) {
        this.selectHighlight()
      }
    },

    selectHighlight: function() {
      this.handleUserSelected(this.state.users[this.state.highlightIndex])
    },

    handleUserSelected: function(user) {
      this.setState({ users: [] })
      this.props.onUserSelected(user)
    },

    constrainHighlight: function(index) {
      return Math.max(
        0, Math.min(this.state.users.length - 1, index)
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = TypeaheadUserSearch
  }

  window.TypeaheadUserSearch = TypeaheadUserSearch
})()
