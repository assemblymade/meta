/** @jsx React.DOM */

var keys = {
  enter: 13,
  esc: 27,
  up: 38,
  down: 40
}

function dot(prop) {
  return function(object) {
    return object[prop]
  }
}

var CoreTeam = React.createClass({
  getInitialState: function() {
    return { users: [this.props.currentUser] }
  },
  render: function() {
    return (
      <table className="table">
        <tbody>
          {this.rows()}
          <tr>
            <td></td>
            <td><UserSearch url="/_es" onUserSelected={this.handleUserSelected} /></td>
            <td><button type="submit" className="btn btn-default" onClick={this.addUserClicked}>Invite to Core</button></td>
          </tr>
        </tbody>
      </table>
    )
  },

  rows: function(){
    return _.map(this.state.users, function(user){ return <MemberRow user={user} />})
  },

  handleUserSelected: function(user) {
   this.setState(React.addons.update(this.state, { users: { $push: [user] }}))
  }
})

var MemberRow = React.createClass({
  render: function(){
    console.log(this.props.user)
    return (
      <tr>
        <td><img className="avatar" src={this.props.user.avatar_url} width={30} height={30}/></td>
        <td>
          @{this.props.user.username}
          <span className="text-muted"> (you)</span>
        </td>
        <td className="text-right">
          <div data-toggle="tooltip" title="You cannot remove yourself from the Core Team" data-placement="top">
            <a href="#" className="btn btn-danger btn-xs disabled" >Remove</a>
          </div>
        </td>
      </tr>
    )
  }
})

