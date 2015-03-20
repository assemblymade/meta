var CONSTANTS = require('../constants');
var PersonPickerStore = require('../stores/person_picker_store');
var Avatar = require('./ui/avatar.js.jsx');

var PP = CONSTANTS.PERSON_PICKER;

var keys = {
  enter: 13,
  esc: 27,
  up: 38,
  down: 40
}

var PersonPicker = React.createClass({
  getInitialState: function() {
    return { users: [], highlightIndex: 0 }
  },

  getDefaultProps: function() {
    return {
      placeholder: '@username or email address'
    }
  },

  clearText: function() {
    this.refs.usernameOrEmail.getDOMNode().value = ''
    this.setState(this.getInitialState())
  },

  render: function(){
    return (
      <div style={{position: 'relative'}}>
        <input className="form-control input-sm" type="text"
               ref="usernameOrEmail"
               onChange={this.handleChange}
               onKeyDown={this.handleKey}
               placeholder={this.props.placeholder} />
        {this.state.users.length > 0 ? this.userPicker() : null }
      </div>
    )
  },

  userPicker: function(){
    return <UserPicker
      users={this.state.users}
      highlightIndex={this.state.highlightIndex}
      onUserSelected={this.handleUserSelected} />
  },

  handleChange: function(e) {
    var text = this.refs.usernameOrEmail.getDOMNode().value
    if(this.isEmail(text)) {
      this.handleEmail(text)
    } else {
      this.handleUsername(text)
    }
  },

  handleUsername: function(text) {
    var postData = {
      suggest_username: {
        text: text.toLowerCase(),
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
        this.props.onValidUserChanged(users[index])
        this.setState({users: users, highlightIndex: index})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('error', arguments)
      }.bind(this)
    });
  },

  handleEmail: function(text) {
    this.props.onValidUserChanged({email: text})
    this.setState({users: []})
  },

  handleKey: function(e) {
    if (e.keyCode == keys.up) {
      e.preventDefault()
      this.moveHighlight(-1)
    } else if (e.keyCode == keys.down) {
      e.preventDefault()
      this.moveHighlight(1)
    } else if (e.keyCode == keys.enter) {
      e.preventDefault()
      this.selectCurrentUser()
    }
  },

  moveHighlight: function(inc) {
    var index = this.constrainHighlight(this.state.highlightIndex + inc)
    this.props.onValidUserChanged(this.state. users[index])
    this.setState({ highlightIndex: index })
  },

  selectCurrentUser: function() {
    var text = this.refs.usernameOrEmail.getDOMNode().value
    this.clearText()

    if (this.state.users.length > 0) {
      this.selectHighlight()
    } else if (this.isEmail(text)) {
      this.selectEmail(text)
    }
  },

  selectHighlight: function() {
    this.handleUserSelected(this.state.users[this.state.highlightIndex])
  },

  selectEmail: function(email) {
    this.props.onUserSelected({email: email})
  },

  handleUserSelected: function(user) {
    this.clearText()
    this.setState({ users: [] })
    this.props.onUserSelected(user)
  },

  constrainHighlight: function(index) {
    return Math.max(
      0, Math.min(this.state.users.length - 1, index)
    )
  },

  isEmail: function(text) {
    return /^@?\w+@/.exec(text)
  }
});

module.exports = window.PersonPicker = PersonPicker;
