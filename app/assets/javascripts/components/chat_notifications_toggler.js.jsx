var CONSTANTS = require('../constants');
var ChatNotificationsStore = require('../stores/chat_notifications_store');
var Dispatcher = require('../dispatcher');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');
var LocalStorageMixin = require('../mixins/local_storage');
var moment = require('moment');

var CN = CONSTANTS.CHAT_NOTIFICATIONS;

var ChatNotificationsToggler = React.createClass({
  mixins: [DropdownTogglerMixin, LocalStorageMixin],

  acknowledge: function() {
    var timestamp = moment().unix();

    localStorage.chatAck = timestamp;

    this.setState({
      acknowledgedAt: timestamp
    });

    Dispatcher.dispatch({
      action: CN.ACTIONS.ACKNOWLEDGE,
      data: timestamp,
      sync: true
    });
  },

  badgeCount: function() {
    return this.shouldRead() ? 1 : 0 // ChatNotificationsStore.getUnreadCount(this.state.acknowledgedAt) : 0;
  },

  componentDidMount: function() {
    ChatNotificationsStore.addChangeListener(this.getNotifications);
  },

  componentWillUnmount: function() {
    ChatNotificationsStore.removeChangeListener(this.getNotifications);
  },

  getDefaultProps: function() {
    return {
      title: document.title
    };
  },

  getInitialState: function() {
    return {
      chatRooms: null,
      acknowledgedAt: this.storedAck('chatAck')
    };
  },

  getNotifications: function() {
    this.setState({
      chatRooms: ChatNotificationsStore.getChatRooms()
    });
  },

  shouldRead: function() {
    return true;
    var chatRoom = ChatNotificationsStore.mostRecentlyUpdatedChatRoom();

    return chatRoom && (chatRoom.updated > chatRoom.last_read_at);
  }
})

module.exports = window.ChatNotificationsToggler = ChatNotificationsToggler;
