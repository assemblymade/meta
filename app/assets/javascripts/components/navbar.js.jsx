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
    getDefaultProps: function() {
      return {
        user: app.currentUser().attributes
      };
    },

    render: function() {
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
                username={this.props.user.username}
            />
          </li>

          <li className="navbar-item-muted">
            <DropdownNotificationsToggler
                iconClass='icon-bell'
                href='#stories'
                label='Notifications' />

            <DropdownNotifications
                url={this.props.notificationsPath}
                username={this.props.user.username}
                editUserPath={this.props.editUserPath} />
          </li>

          <li className='dropdown'>
            <a href='#' className='dropdown-toggle' data-toggle='dropdown' key={'navbar dropdown'} style={{ padding: '12px 6px' }}>
              <Avatar user={this.props.user} size="26" />
              <span className='visible-xs-inline' style={{ 'margin-left': '5px' }}>
                {this.props.user.username}
              </span>
            </a>

            {this.transferPropsTo(<UserNavbarDropdown />)}
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
