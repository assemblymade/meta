/** @jsx React.DOM */

(function() {

function atUsername(user) {
  return '@' + user.username
}

function avatarUrl(user, size) {
  return user.avatar_url + '?s=' + 48
}

window.CoreTeam = React.createClass({
  getInitialState: function() {
    return { users: [] }
  },
  render: function() {
    return (
      <table className="table">
        <tbody>
          <tr className="active">
            <td>
              <img alt={atUsername(this.props.currentUser)}
                   className="avatar img-circle"
                   height="24" width="24"
                   src={avatarUrl(this.props.currentUser, 48)} />
            </td>
            <td>{atUsername(this.props.currentUser)}</td>
            <td className="text-right">
              <span className="text-muted">(you)</span>
            </td>
          </tr>
          {this.rows()}
          <tr>
            <td><img className="avatar img-circle" height="24" src="/assets/avatars/default.png" width="24" /></td>
            <td><PersonPicker url="/_es" onUserSelected={this.handleUserSelected} /></td>

            <td className="text-right">
              <a className="text-success" href="#" onClick={this.addUserClicked}>
                <span className="icon icon-plus-circled"></span>
                <span className="sr-only">Add</span>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    )
  },

  rows: function(){
    return _.map(this.state.users, function(user){
      return <MemberRow user={user} onRemove={this.handleUserRemoved(user)} />
    }.bind(this))
  },

  handleUserSelected: function(user) {
   this.setState(React.addons.update(this.state, { users: { $push: [user] }}))
  },

  handleUserRemoved: function(user) {
    var users = _.reject(users, function(u){ u.id == user.id })

    return function() {
      this.setState({users: users})
    }.bind(this)
  }
})

function preventDefault(fn) {
  return function(e) {
    e.preventDefault()
    fn(e)
  }
}

var MemberRow = React.createClass({
  render: function(){
    return (
      <tr key={this.props.user.id}>
        <td><img className="avatar" src={avatarUrl(this.props.user, 48)} width={24} height={24}/></td>
        <td>@{this.props.user.username}</td>

        <td className="text-right">
          <a href="#" onClick={preventDefault(this.props.onRemove)} className="text-muted link-hover-danger">
            <span className="icon icon-close"></span>
            <span className="sr-only">Remove</span>
          </a>
        </td>
      </tr>
    )
  }
})

})();