/** @jsx React.DOM */

//= require constants
//= require stores/chat_notifications_store
//= require mixins/dropdown_toggler

(function() {
  var CN = CONSTANTS.CHAT_NOTIFICATIONS;

  window.ChatNotificationsToggler = React.createClass({
    mixins: [DropdownTogglerMixin],

    acknowledge: function() {
      var timestamp = +Date.now();

      localStorage.notificationsAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      Dispatcher.dispatch({
        event: CN.EVENTS.ACKNOWLEDGED,
        action: CN.ACTIONS.ACKNOWLEDGE,
        payload: timestamp,
        sync: true
      });
    },

    badge: function() {
      return (
        <span
            className='indicator indicator-danger'
            style={{ position: 'relative', top: '5px' }} />
      );
    },

    badgeCount: function() {
      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        return ChatNotificationsStore.getUnreadCount(this.state.acknowledgedAt);
      }

      return 0;
    },

    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.getStories);
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
        stories: ChatNotificationsStore.getStories()
      });
    },

    latestStory: function() {
      var stories = this.state.stories;

      if (!stories) {
        return;
      }

      var story;
      for (var i = 0, l = stories.length; i < l; i++) {
        // product.updated is ~when the chat message was created
        if (story && stories[i].product.updated > story.product.updated) {
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

      return story && story.product.updated ? +new Date(story.product.updated) : 0;
    },

    total: function() {
      var self = this;

      var count = _.reduce(
        _.map(self.state.stories, function mapStories(story) {
          return story.count;
        }), function reduceStories(memo, read) {
          return memo + read;
      }, 0);

      return count;
    },

    storedAck: function() {
      var timestamp = localStorage.notificationsAck;

      if (timestamp == null || timestamp === 'null') {
        return 0;
      } else {
        return parseInt(timestamp, 10);
      }
    }
  });
})();
