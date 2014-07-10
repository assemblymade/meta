/** @jsx React.DOM */

var UserSearch = React.createClass({
  getInitialState: function() {
    return { users: [], highlightIndex: 0 }
  },

  render: function(){
    return (
      <div style={{position: 'relative'}}>
        <input type="text" ref="usernameOrEmail" onChange={this.handleChange} onKeyDown={this.handleKey} />
        {this.state.users.length > 0 ? this.userPicker() : null }
      </div>
    )
  },

  userPicker: function(){
    return <UserPicker users={this.state.users} highlightIndex={this.state.highlightIndex} onUserSelected={this.handleUserSelected} />
  },

  handleChange: function(e) {
    var postData = {
      suggest_username: {
        text: this.refs.usernameOrEmail.getDOMNode().value,
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
        this.setState({users: users})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('error', arguments)
      }.bind(this)
    });
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
      this.selectHighlight()
    }
  },

  moveHighlight: function(inc) {
    var newIndex = Math.max(
      0, Math.min(this.state.users.length - 1, this.state.highlightIndex + inc)
    )

    this.setState({ highlightIndex: newIndex })
  },

  selectHighlight: function() {
    this.handleUserSelected(this.state.users[this.state.highlightIndex])
  },

  handleUserSelected: function(user) {
    this.refs.usernameOrEmail.getDOMNode().value = ''
    this.setState({
      users: []
    })
    this.props.onUserSelected(user)
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
      return <UserPickerEntry key={user.username} user={user} selected={i == this.props.highlightIndex} onUserSelected={this.props.onUserSelected} />
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
})