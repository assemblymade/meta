var Avatar = require('./ui/avatar.js.jsx');
var DropdownMenu = require('./ui/dropdown_menu.js.jsx')
var DropdownMixin = require('../mixins/dropdown_mixin.js.jsx')

var OnboardingNavbar = React.createClass({
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
          <DropdownMenu.Item label="Log out" icon="logout" action={this.props.destroyUserSessionPath} method="delete" />
        </DropdownMenu>
      )
    }

    return (
      <ul className="list-reset">
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

module.exports = window.OnboardingNavbar = OnboardingNavbar
