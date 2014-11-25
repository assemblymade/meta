/** @jsx React.DOM */

(function() {
  var CONSTANTS = window.CONSTANTS;
  var ChatNotificationsStore = require('../stores/chat_notifications_store');
  var NotificationsStore = require('../stores/notifications_store');

  var TitleNotificationsCount = React.createClass({
    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.setTitle);
      NotificationsStore.addChangeListener(this.setTitle);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        count: 0
      };
    },

    render: function() {
      return <span />;
    },

    setTitle: function() {
      var chatCount = ChatNotificationsStore.getUnreadCount(parseInt(localStorage.chatAck, 10)) || 0;
      var newsCount = NotificationsStore.getUnreadCount(parseInt(localStorage.notificationsAck, 10)) || 0;

      var total = chatCount + newsCount;

      document.title = total > 0 ?
        '(' + total + ') ' + this.props.title :
        this.props.title;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TitleNotificationsCount;
  }

  window.TitleNotificationsCount = TitleNotificationsCount;
})();
