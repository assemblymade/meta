var Avatar = require('./ui/avatar.js.jsx');
var ChatNotifications = require('./chat_notifications.js.jsx');
var ChatNotificationsToggler = require('./chat_notifications_toggler.js.jsx');
var DropdownMenu = require('./ui/dropdown_menu.js.jsx')
var DropdownMixin = require('../mixins/dropdown_mixin.js.jsx')
var DropdownNotifications = require('./dropdown_notifications.js.jsx');
var DropdownNotificationsToggler = require('./dropdown_notifications_toggler.js.jsx');
var TitleNotificationsCount = require('./title_notifications_count.js.jsx');

var Navbar = React.createClass({
  mixins: [DropdownMixin],

  render: function() {
    var appUser = window.app.currentUser().attributes;
    var user = this.props.currentUser;
    var divStyle = {
      padding: '11px 0 10px 7px'
    };

    var userDropdownMenu = null;
    if (this.isDropdownOpen()) {
      userDropdownMenu = (
        <DropdownMenu position="right" key="user dropdown menu">
          <DropdownMenu.Item label="Dashboard" icon="home" action={this.props.dashboardPath} />
          <DropdownMenu.Item label="Profile" icon="user" action={this.props.userPath} />
          <DropdownMenu.Item label="Settings" icon="settings" action={this.props.editUserPath} />

          <DropdownMenu.Divider />

          <DropdownMenu.Item label="Log out" icon="logout" action={this.props.destroyUserSessionPath} method="delete" />
        </DropdownMenu>
      )
    }

    return (
      <ul className="list-reset">
        <li className="hidden">
          <TitleNotificationsCount />
        </li>

        <li className="left navbar-item-muted sm-show px1">
          <ChatNotificationsToggler
            icon="comment"
            href='#notifications'
            label='Chat' />

          <ChatNotifications
              url={this.props.chatPath}
              username={appUser.username} />
        </li>

        <li className="left navbar-item-muted sm-show px1">
          <DropdownNotificationsToggler
              icon="bell"
              href='#stories'
              label='Notifications' />

          <DropdownNotifications
              url={this.props.notificationsPath}
              username={appUser.username}
              editUserPath={this.props.editUserPath} />
        </li>

        <li className="left dropdown hidden-xs">
          <a className="block dropdown-toggle px1" style={divStyle} key={'navbar dropdown'} onClick={this.toggleDropdown} href="javascript:;">
            <Avatar user={appUser} size="27" />
            <span className="visible-xs-inline ml1">{appUser.username}</span>
          </a>
          {userDropdownMenu}
        </li>
      </ul>
    )
  }

})

module.exports = window.Navbar = Navbar
