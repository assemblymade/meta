/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var PersonPickerStore = require('../stores/person_picker_store');
var Avatar = require('./avatar.js.jsx');

(function() {

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
                 onBlur={this.selectCurrentUser}
                 placeholder="@username or email address" />
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
  })

  var UserPicker = React.createClass({
    render: function() {
      var style = {
        position: 'absolute',
        'z-index': 100,
        top: 27,
        left: 0,
        display: 'block'
      }

      return (
        <ul className="dropdown-menu" style={style}>
          {this.rows()}
        </ul>
      )
    },

    rows: function() {
      var i = -1
      return _.map(this.props.users, function(user){
        i += 1
        return <UserPickerEntry key={user.username} user={user} selected={i === this.props.highlightIndex} onUserSelected={this.props.onUserSelected} />
      }.bind(this))
    }
  })

  var UserPickerEntry = React.createClass({
    render: function() {
      var className = 'textcomplete-item'
      if (this.props.selected) {
        className += ' active'
      }

      return (
        <li className={className}>
          <a href={'#@' + this.props.user.username} onClick={this.handleUserSelected(this.props.user)}>
            <Avatar user={this.props.user}
                style={{'margin-right': '10px'}} />
            @{this.props.user.username} <span className="text-muted">{this.props.user.name}</span>
          </a>
        </li>
      )
    },

    handleUserSelected: function(user) {
      return function() {
        this.props.onUserSelected(user)
      }.bind(this)
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = PersonPicker;
  }

  window.PersonPicker = PersonPicker;

})();
