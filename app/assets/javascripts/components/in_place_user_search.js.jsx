var keys = {
  enter: 13,
  esc: 27,
  tab: 9,
  up: 38,
  down: 40
}

var PeopleStore = require('../stores/people_store')
var PeopleActionCreators = require('../actions/people_action_creators')

module.exports = React.createClass({
  propTypes: {
    username: React.PropTypes.string,
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

  componentDidMount: function() {
    PeopleStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    PeopleStore.removeChangeListener(this._onChange)
  },

  getInitialState: function() {
    return {
      users: [],
      highlightIndex: 0
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.username && (prevProps.username != this.props.username)) {
      this._onChange()
      PeopleActionCreators.searchUsers(this.props.username)
    }
  },

  shouldShowUserList: function() {
    return this.props.username != null
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
    var index = this.constrainHighlight(this.state.highlightIndex + inc, this.state.users.length)
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

  constrainHighlight: function(index, length) {
    return Math.max(
      0, Math.min(length - 1, index)
    )
  },

  _onChange: function() {
    var users = PeopleStore.filterByUsername(this.props.username)

    this.setState({
      users: users,
      highlightIndex: this.constrainHighlight(this.state.highlightIndex, users.length)
    })
  }
})
