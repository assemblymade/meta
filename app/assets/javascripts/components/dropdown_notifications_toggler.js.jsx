/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');
var LocalStorageMixin = require('../mixins/local_storage');
var NotificationsStore = require('../stores/notifications_store');

(function() {
  var NF = CONSTANTS.NOTIFICATIONS;

  var DropdownNotificationsToggler = React.createClass({
    mixins: [DropdownTogglerMixin, LocalStorageMixin],

    acknowledge: function() {
      var timestamp = moment().unix();

      localStorage.notificationsAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      Dispatcher.dispatch({
        action: NF.ACTIONS.ACKNOWLEDGE,
        data: timestamp,
        sync: true
      });
    },

    badge: function(total) {
      return <strong className="ml1">{this.badgeCount()}</strong>;
    },

    badgeCount: function() {
      return NotificationsStore.getUnreadCount(this.state.acknowledgedAt);
    },

    componentWillMount: function() {
      NotificationsStore.addChangeListener(this.getStories);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        stories: null,
        acknowledgedAt: this.storedAck('notificationsAck')
      };
    },

    getStories: function() {
      this.setState({
        stories: NotificationsStore.getStories()
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
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DropdownNotificationsToggler;
  }

  window.DropdownNotificationsToggler = DropdownNotificationsToggler;
})();
