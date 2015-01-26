(function() {
  var EventMixin = {
    timestamp: function(story) {
      return moment(story || this.props.story.created_at).format("ddd, hA")
    },

    subjectMap: {
      Discussion: function(discussion) {
        return 'a discussion';
      },

      Post: function(post) {
        return 'a post'
      },

      Task: function(task) {
        if (task) {
          return "#" + task.number + " " + task.title;
        }
      },

      TeamMembership: function() {
        return 'your introduction'
      },

      Wip: function(wip) {
        if (wip) {
          return "#" + wip.number + " " + wip.title;
        }
      }
    },

    verbMap: {
      'Award': 'awarded ',
      'Close': 'closed ',
      'Comment': 'commented on ',
      'Introduce': 'introduced themselves ',
      'Post': 'published ',
      'Start': 'started '
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = EventMixin;
  }

  window.EventMixin = EventMixin;
})();
