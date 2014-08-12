(function() {
  var EventMixin = {
    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    subjectMap: {
      Task: function(task) {
        if (task) {
          return "#" + task.number + " " + task.title;
        }
      },

      Discussion: function(discussion) {
        return 'a discussion';
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title;
        }

        return "#" + bounty.number;
      },
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded',
      'Close': 'closed ',
      'Start': 'started '
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = EventMixin;
  }

  window.EventMixin = EventMixin;
})();
