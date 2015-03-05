

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

          <ul className="dropdown-menu pull-right" role="menu">
            {this.currentUserList()}
            <li role="presentation" className="dropdown-header">Core Team</li>
            {this.listItems(this.props.core_team)}
          </ul>
        </li>
      )
    },

    currentUserList: function() {
      if(this.props.current_user) {
        return [
          <li role="presentation" className="dropdown-header">You</li>,
          this.listItems([this.props.current_user]),
          <li role="presentation" className="divider"></li>
        ]
      }
    },

    listItems: function(users) {
      return users.map(function(user) {
        selected = user.id == this.props.selected_user_id

        return (
          <li className={selected ? 'active' : ''} key={user.id}>
            <a href={this.props.buildUrl({ user: user })} role="menuitem" tabIndex="-1">
              <div className="left mr2">
                <Avatar user={user} />
              </div>
              <span>@{user.username}</span>
              {' '}
              <span className="gray-2">{user.name}</span>
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
