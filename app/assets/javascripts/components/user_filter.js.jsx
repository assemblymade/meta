/** @jsx React.DOM */

(function() {
  var UserFilter = React.createClass({
    render: function() {
      var current_user = this.props.current_user;

      return (
        <li className="dropdown">
          <a className="dropdown-toggle" type="button" data-toggle="dropdown" href="#">
            User
            {' '}
            <span className="caret"></span>
          </a>

          <ul className="dropdown-menu" role="menu">
            <li role="presentation" className="divider"></li>

            <li role="presentation" className="dropdown-header">You</li>
            {this.listItems([this.props.current_user])}

            <li role="presentation" className="divider"></li>

            <li role="presentation" className="dropdown-header">Core Team</li>
            {this.listItems(this.props.core_team)}
            <li>
              <a href={this.props.buildUrl({ user: current_user })} role="menuitem" tabIndex="-1">
                <Avatar user={current_user} />
                {' '}
                <span>@{current_user.username}</span>
                {' '}
                <span className="text-muted">{current_user.name}</span>
              </a>
            </li>
          </ul>
        </li>
      )
    },

    listItems: function(users) {
      return users.map(function(user) {
        return (
          <li key={user.id}>
            <a href={this.props.buildUrl({ user: user })} role="menuitem" tabIndex="-1">
              <Avatar user={user} />
              {' '}
              <span>@{user.username}</span>
              {' '}
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
