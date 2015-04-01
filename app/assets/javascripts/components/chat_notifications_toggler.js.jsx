var CONSTANTS = require('../constants');
var ChatNotificationsStore = require('../stores/chat_notifications_store');
var Dispatcher = require('../dispatcher');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');
var LocalStorageMixin = require('../mixins/local_storage');
var moment = require('moment');

var ChatNotificationsToggler = React.createClass({
  mixins: [DropdownTogglerMixin, LocalStorageMixin],

  acknowledge: function() {
    var timestamp = moment().unix();

    localStorage.chatAck = timestamp;

    this.setState({
      acknowledgedAt: timestamp
    });
  },

  badgeCount: function() {
    return ChatNotificationsStore.getUnreadCount(this.state.acknowledgedAt);
  },

  getDefaultProps: function() {
    return {
      title: document.title
    };
  },

  getInitialState: function() {
    return {
      acknowledgedAt: this.storedAck('chatAck')
    };
  }
});

module.exports = window.ChatNotificationsToggler = ChatNotificationsToggler;
