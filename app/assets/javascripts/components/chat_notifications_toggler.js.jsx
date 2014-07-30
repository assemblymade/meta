/** @jsx React.DOM */

//= require constants
//= require mixins/dropdown_toggler

(function() {
  var CN = CONSTANTS.CHAT_NOTIFICATIONS;

  window.ChatNotificationsToggler = React.createClass({
    mixins: [DropdownTogglerMixin],

    badge: function() {
      return (
        <span
            className='indicator indicator-danger'
            style={{ position: 'relative', top: '5px' }} />
      );
    },

    badgeCount: function() {
      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        return this.total();
      }
    },

    componentWillMount: function() {
      var store = this.props.store;

      ChatNotificationsStore.addChangeListener(
        CN.EVENTS.STORIES_FETCHED,
        this.getStories
      );
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

    render: function() {
      var classes = ['icon', 'navbar-icon', this.props.iconClass];
      var total = this.badgeCount();
      var badge = null;

      if (total > 0) {
        badge = this.badge();
        classes.push('glyphicon-highlight');
      }

      return (
        <a href={this.props.href} data-toggle='dropdown' onClick={this.acknowledge}>
          <span className={classes.join(' ')}></span>
          {badge}
          <span className='visible-xs-inline' style={{ 'margin-left': '5px' }}>
            {this.props.label}
          </span>
        </a>
      );
    },

    total: function() {
      var self = this;

      var count = _.reduce(
        _.map(self.state.stories, function mapStories(story) {
          return story.entities && story.entities.length;
        }), function reduceStories(memo, read) {
          return memo + read;
      }, 0);

      return count;
    }
  });
})();
