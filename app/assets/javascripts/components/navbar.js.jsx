'use strict';

var Avatar = require('./ui/avatar.js.jsx');
var ChatNotifications = require('./chat_notifications.js.jsx');
var ChatNotificationsToggler = require('./chat_notifications_toggler.js.jsx');
var DropdownMenu = require('./ui/dropdown_menu.js.jsx')
var DropdownMixin = require('../mixins/dropdown_mixin.js.jsx')
var DropdownNotifications = require('./dropdown_notifications.js.jsx');
var DropdownNotificationsToggler = require('./dropdown_notifications_toggler.js.jsx');
var HeartsReceived = require('./user/hearts_received.js.jsx')
var routes = require('../routes')
var StoryActions = require('../actions/story_actions')
var StoryStore = require('../stores/story_store');
var TitleNotificationsCount = require('./title_notifications_count.js.jsx');
var UserStore = require('../stores/user_store');

var Navbar = React.createClass({
  mixins: [DropdownMixin],

  getInitialState() {
    return this.getStateFromStores()
  },

  render() {
    var appUser = UserStore.getUser();
    var divStyle = {
      padding: '11px 0 10px 7px'
    };

    var userDropdownMenu = null;
    if (this.isDropdownOpen()) {
      userDropdownMenu = (
        <DropdownMenu position="right" key="user dropdown menu">
          <DropdownMenu.Item label="Start an idea" icon="lightbulb-o" action='/ideas/new' />
          <DropdownMenu.Item label="Import product" icon="building" action='/new' />

          <DropdownMenu.Divider />

          <DropdownMenu.Item label="Dashboard" icon="home" action={this.props.dashboardPath} />
          <DropdownMenu.Item label="Profile" icon="user" action={this.props.userPath} />
          <DropdownMenu.Item label="Settings" icon="cog" action={this.props.editUserPath} />

          <DropdownMenu.Divider />

          <DropdownMenu.Item label="Log out" icon="sign-out" action={this.props.destroyUserSessionPath} method="delete" />
        </DropdownMenu>
      )
    }

    return (
      <ul className="list-reset">
        <li className="hidden">
          <TitleNotificationsCount />
        </li>

        <li className="left sm-show px1">
          <HeartsReceived />
        </li>

        {this.state.showChat && this.renderChatNotifications()}
        {this.state.showStories && this.renderStories()}

        <li className="left dropdown hidden-xs">
          <a className="block dropdown-toggle px1" style={divStyle} key="navbar dropdown" onClick={this.toggleDropdown} href="javascript:;">
            <Avatar user={appUser} size={27} />
            <span className="visible-xs-inline ml1">{appUser.username}</span>
          </a>
          {userDropdownMenu}
        </li>
      </ul>
    )
  },

  renderChatNotifications() {
    return <li className="left sm-show px1">
      <ChatNotificationsToggler
        icon="comments"
        href='#notifications'
        label='Chat' />

      <ChatNotifications
          url={this.props.chatPath}
          username={UserStore.getUser().username} />
    </li>
  },

  renderStories() {
    return <li className="left sm-show px1">
      <DropdownNotificationsToggler
          icon="bell"
          href='#stories'
          label='Notifications' />

      <DropdownNotifications
          url={this.props.notificationsPath}
          username={UserStore.getUser().username}
          editUserPath={this.props.editUserPath} />
    </li>
  },

  componentDidMount() {
    StoryStore.addChangeListener(this._onChange)
    StoryActions.fetchStories()
  },

  componentWillUnmount() {
    StoryStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState(this.getStateFromStores())
  },

  getStateFromStores() {
    let stories = StoryStore.getStories()
    return {
      showStories: (stories && stories.length > 0),
      showChat: moment(UserStore.getUser().created_at).add(2, 'minutes').isBefore(moment())
    }
  }

})

module.exports = window.Navbar = Navbar
