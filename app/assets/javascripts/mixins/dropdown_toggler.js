/** @jsx React.DOM */

(function() {
  window.DropdownTogglerMixin = {
    acknowledge: function() {
      var timestamp = Math.floor(Date.now() / 1000);

      localStorage.notificationsAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      this.setTitle && this.setTitle();
    },

    storedAck: function() {
      var timestamp = localStorage.newsFeedAck;

      if (timestamp == null || timestamp === 'null') {
        return -1;
      } else {
        return parseInt(timestamp, 10);
      }
    }
  };
})();
