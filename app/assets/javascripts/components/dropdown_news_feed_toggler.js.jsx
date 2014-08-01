/** @jsx React.DOM */

//= require constants
//= require mixins/dropdown_toggler
//= require stores/news_feed_store

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  window.DropdownNewsFeedToggler = React.createClass({
    mixins: [DropdownTogglerMixin],

    acknowledge: function() {
      var timestamp = moment().unix();

      localStorage.newsFeedAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      Dispatcher.dispatch({
        event: NF.EVENTS.ACKNOWLEDGED,
        action: NF.ACTIONS.ACKNOWLEDGE,
        data: timestamp,
        sync: true
      });
    },

    badge: function(total) {
      return <span className='badge badge-notification'>{total}</span>;
    },

    badgeCount: function() {
      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        return NewsFeedStore.getUnreadCount(this.state.acknowledgedAt);
      }

      return 0;
    },

    componentWillMount: function() {
      NewsFeedStore.addChangeListener(this.getStories);
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
        stories: NewsFeedStore.getStories()
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

      return story && story.updated ? story.updated : 0;
    },

    storedAck: function() {
      var timestamp = localStorage.newsFeedAck;

      if (timestamp == null || timestamp === 'null') {
        return 0;
      } else {
        return parseInt(timestamp, 10);
      }
    }
  });
})();
