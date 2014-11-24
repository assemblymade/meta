(function() {
  var EventMixin = {
    timestamp: function(story) {
      return moment(story || this.props.story.created).format("ddd, hA")
    },

    subjectMap: {
      Discussion: function(discussion) {
        return 'a discussion';
      },

      Post: function(post) {
        return 'a new blog post'
      },

      Task: function(task) {
        if (task) {
          return "#" + task.number + " " + task.title;
        }
      },
      Wip: function(wip) {
        if (wip) {
          return "#" + task.number + " " + task.title;
        }
      }
    },

    verbMap: {
      'Award': 'awarded',
      'Close': 'closed ',
      'Comment': 'commented on ',
      'Post': 'published ',
      'Start': 'started '
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = EventMixin;
  }

  window.EventMixin = EventMixin;
})();
