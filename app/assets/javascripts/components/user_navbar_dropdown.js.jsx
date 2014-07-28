/** @jsx React.DOM */

(function() {
  window.UserNavbarDropdown = React.createClass({
    render: function() {
      return (
        <ul className='dropdown-menu'>
          <li>
            <a href={this.props.userPath}>
              <span className="icon icon-user dropdown-glyph"></span>
              Profile
            </a>
          </li>

          <li>
            <a href={this.props.editUserPath}>
              <span className="icon icon-settings dropdown-glyph"></span>
              Setttings
            </a>
          </li>

          <li className='divider' />

          <li>
            <a href={this.destroyUserSessionPath} data-method='delete'>
              <span className='icon icon-logout dropdown-glyph'></span>
              Log out
            </a>
          </li>
        </ul>
      );
    }
  });
})();
