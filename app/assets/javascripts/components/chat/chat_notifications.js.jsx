'use strict';

const ActionTypes = require('../../constants').ActionTypes;
const ChatNotificationsActions = require('../../actions/chat_notifications_actions');
const ChatNotificationsStore = require('../../stores/chat_notifications_store');
const DesktopNotifications = require('../desktop_notifications.js.jsx');
const Dispatcher = require('../../dispatcher');
const LocalStorageMixin = require('../../mixins/local_storage.js');
const NotificationsList = require('./chat_notifications_list.js.jsx');
const Spinner = require('../spinner.js.jsx');
const UserStore = require('../../stores/user_store.js');

const ChatNotifications = React.createClass({
  mixins: [LocalStorageMixin],

  componentDidMount() {
    ChatNotificationsStore.addChangeListener(this.onChatNotifications);
  },

  getInitialState() {
    return {
      desktopNotificationsEnabled: false
    };
  },

  handleDesktopNotificationsStateChange(isEnabled) {
    this.setState({
      desktopNotificationsEnabled: isEnabled
    });
  },

  markAllAsRead() {
    ChatNotificationsActions.markAsRead(this.state.unreadRooms);
  },

  onChatNotifications() {
    this.setState({
      chatRooms: ChatNotificationsStore.getChatRoomsWithUnreadMarked()
    });
  },

  render() {
    let style = {
      list: {
        minHeight: 120
      },
      markAllAsRead: {
        border: 'none'
      },
      ul: {
        minWidth: 380
      }
    };

    return (
      <ul className="dropdown-menu" style={style.ul}>
        <li style={style.list}>
          <NotificationsList {...this.state} />
        </li>
        <li className="divider"></li>

        <li>
          <a href="javascript:void(0);"
            onClick={this.markAllAsRead}
            className="text-small list-group-item"
            style={style.markAllAsRead}>
            Mark all as read
          </a>
        </li>

        {this.renderDesktopNotifications()}
      </ul>
    );
  },

  renderDesktopNotifications() {
    if (!this.state.desktopNotificationsEnabled) {
      return (
        <li>
          <DesktopNotifications onChange={this.handleDesktopNotificationsStateChange} />
        </li>
      );
    }
  }
});

module.exports = ChatNotifications;
