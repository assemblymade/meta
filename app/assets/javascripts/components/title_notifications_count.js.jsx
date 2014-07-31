/** @jsx React.DOM */

//= require constants
//= require stores/chat_notifications_store

(function() {
  window.TitleNotificationsCount = React.createClass({
    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.setTitle);
      DropdownNewsFeedStore.addChangeListener(this.setTitle);
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
      var chatCount = ChatNotificationsStore.getUnreadCount(localStorage.notificationsAck) || 0;
      var newsCount = DropdownNewsFeedStore.getUnreadCount(localStorage.newsFeedAck) || 0;

      var total = chatCount + newsCount;

      document.title = total > 0 ?
        '(' + total + ') ' + this.props.title :
        this.props.title;
    }
  });
})();
