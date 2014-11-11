/** @jsx React.DOM */

(function() {
  var CONSTANTS = require('../constants');
  var Dispatcher = require('../dispatcher');
  var TitleNotificationsCount = require('./title_notifications_count.js.jsx');
  var DropdownNotificationsToggler = require('./dropdown_notifications_toggler.js.jsx');
  var DropdownNotifications = require('./dropdown_notifications.js.jsx');
  var ChatNotificationsToggler = require('./chat_notifications_toggler.js.jsx');
  var ChatNotifications = require('./chat_notifications.js.jsx');
  var UserNavbarDropdown = require('./user_navbar_dropdown.js.jsx');
  var Avatar = require('./avatar.js.jsx');

  var Navbar = React.createClass({
    render: function() {
      var appUser = window.app.currentUser().attributes
      var user = this.props.currentUser;

      return (
        <ul className='nav navbar-nav'>
          <li>
            <TitleNotificationsCount />
          </li>

          <li className="navbar-item-muted">
            <ChatNotificationsToggler
              iconClass='icon-bubble'
              href='#notifications'
              label='Chat' />

            <ChatNotifications
                url={this.props.chatPath}
                username={appUser.username}
            />
          </li>

          <li className="navbar-item-muted">
            <DropdownNotificationsToggler
                iconClass='icon-bell'
                href='#stories'
                label='Notifications' />

            <DropdownNotifications
                url={this.props.notificationsPath}
                username={appUser.username}
                editUserPath={this.props.editUserPath} />
          </li>

          <li className='dropdown'>
            <a href='#' className='dropdown-toggle' data-toggle='dropdown' key={'navbar dropdown'} style={{ padding: '15px 6px 13px' }}>
              <Avatar user={appUser} size="24" />
              <span className='visible-xs-inline' style={{ marginLeft: '5px' }}>
                {appUser.username}
              </span>
            </a>

            <UserNavbarDropdown {...this.props} />
          </li>
        </ul>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Navbar;
  }

  window.Navbar = Navbar;
})();
