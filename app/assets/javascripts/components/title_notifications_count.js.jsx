/** @jsx React.DOM */

//= require constants
//= require stores/chat_notifications_store

(function() {
  window.TitleNotificationsCount = React.createClass({
    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener()
    },

    getInitialState: function() {
      return {
        count: 0
      };
    },

    render: function() {
      return <span />;
    }
  });
})();
