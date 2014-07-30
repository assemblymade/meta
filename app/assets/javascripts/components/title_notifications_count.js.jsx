/** @jsx React.DOM */

//= require constants
//= require stores/chat_notifications_store

(function() {
  window.TitleNotificationsCount = React.createClass({
    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.setTitle);
      DropdownNewsFeedStore.addChangeListener(this.setTitle);
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
      console.log('setting title');
    }
  });
})();
