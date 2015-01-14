var Avatar = require('./ui/avatar.js.jsx');
var ChatNotifications = require('./chat_notifications.js.jsx');
var ChatNotificationsToggler = require('./chat_notifications_toggler.js.jsx');
var DropdownNotifications = require('./dropdown_notifications.js.jsx');
var DropdownNotificationsToggler = require('./dropdown_notifications_toggler.js.jsx');
var TitleNotificationsCount = require('./title_notifications_count.js.jsx');
var UserNavbarDropdown = require('./user_navbar_dropdown.js.jsx');

module.exports =  React.createClass({
  render: function() {
    var appUser = window.app.currentUser().attributes;
    var user = this.props.currentUser;
    var divStyle = {
      padding: '11px 0 10px 7px'
    };

    return (
      <ul className="list-reset">
        <li className="left dropdown hidden-xs">
          <a href='javascript:void(0);' className="block dropdown-toggle px1" style={divStyle} data-toggle='dropdown' key={'navbar dropdown'}>
            <Avatar user={appUser} size="27" />
            <span className="visible-xs-inline ml1">{appUser.username}</span>
          </a>

          <ul className="dropdown-menu">
            <li>
              <a href={this.props.destroyUserSessionPath} data-method='delete'>
                <span className='icon icon-logout dropdown-glyph'></span>
                Log out
              </a>
            </li>
          </ul>
        </li>
      </ul>
    );
  }
});

window.OnboardingNavbar = module.exports;
