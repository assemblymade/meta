/** @jsx React.DOM */

//= require constants
//= require mixins/dropdown_toggler
//= require stores/dropdown_news_feed_store

(function() {
  window.DropdownNewsFeedToggler = React.createClass({
    mixins: [DropdownTogglerMixin],

    badge: function(total) {
      return <span className='badge badge-notification'>{total}</span>;
    },

    badgeCount: function() {
      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        var unreadStories = this.state.stories &&
          _.filter(
            this.state.stories,
            function(story) {
              return story.readAt == null;
            }
          );

        return unreadStories && unreadStories.length;
      }
    },

    componentWillMount: function() {
      DropdownNewsFeedStore.addChangeListener(this.getStories);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        stories: null,
        acknowledgedAt: this.storedAck()
      };
    },

    getStories: function() {
      this.setState({
        stories: DropdownNewsFeedStore.getStories()
      });
    },

    latestStory: function() {
      var stories = this.state.stories;

      if (!stories) {
        return;
      }

      var story;
      for (var i = 0, l = stories.length; i < l; i++) {
        if (story && stories[i].updated > story.updated) {
          story = stories[i];
        }

        if (!story) {
          story = stories[i];
        }
      }

      return story;
    },

    latestStoryTimestamp: function() {
      var story = this.latestStory();

      return story && story.updated ? Math.floor(+new Date(story.updated) / 1000) : 0;
    }
  });
})();
