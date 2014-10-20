/** @jsx React.DOM */

(function() {
  var UserFilter = React.createClass({
    getInitialState: function() {
      return {
        user: this.props.selected_user,
        users: this.props.defaultUsers
      }
    },

    render: function() {
      return (
        <li className="dropdown">
          <a className="dropdown-toggle" type="button" data-toggle="dropdown" href="#">
            User
            <span className="caret"></span>
          </a>

          <ul className="dropdown-menu" role="menu">
            {this.listItems()}
          </ul>
        </li>
      )
    },

    listItems: function() {
      return this.state.users.map(function(user) {
        return (
          <li key={user.id}>
            <a href={this.props.buildUrl({ user: user })} role="menuitem" tabIndex="-1">
              <Avatar user={user} />
              <span>@{user.username}</span>
              <span className="text-muted">{user.name}</span>
            </a>
          </li>
        )
      }.bind(this))
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = UserFilter
  }

  window.UserFilter = UserFilter
})();
