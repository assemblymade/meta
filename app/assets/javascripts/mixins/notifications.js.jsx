/** @jsx React.DOM */

(function() {
  var CONSTANTS = require('../constants');
  var NotificationsStore = require('../stores/notifications_store');
  var NotificationsUsersStore = require('../stores/notifications_users_store');
  var update = require('react/lib/update');

  var NF = CONSTANTS.NOTIFICATIONS;
  var MORE_STORIES_LENGTH = NF.MORE_STORIES_LENGTH;

  var NotificationsMixin = {
    componentDidMount: function() {
      var target = this.refs.spinner && this.refs.spinner.getDOMNode();
      var opts = this.spinnerOptions || {
        lines: 10,
        length: 8,
        radius: 10
      };

      var spinner = this.spinner = new Spinner(opts).spin();

      target.appendChild(spinner.el);
      NotificationsStore.addChangeListener(this.getStories);
    },

    componentWillMount: function() {
      this.fetchNotifications();

      this.onPush(function() {
        this.fetchNotifications();
      }.bind(this));
    },

    fetchNotifications: _.debounce(function() {
      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_STORIES,
        data: this.props.url
      });
    }, 1000),

    getInitialState: function() {
      return {
        stories: null,
        showMore: true
      };
    },

    getStories: function() {
      var self = this;
      var oldStoriesCount = this.state.stories && this.state.stories.length;
      var newStories = NotificationsStore.getStories();

      this.setState({
        stories: newStories,
        actors: NotificationsUsersStore.getUsers(),
        showMore: (newStories.length - oldStoriesCount === MORE_STORIES_LENGTH)
      }, reconcileStoriesAndSpinner.bind(this));
    },

    moreStories: function() {
      var lastStory = this.state.stories[this.state.stories.length - 1];

      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_MORE_STORIES,
        data: this.props.url + '?top_id=' + lastStory.id
      });
    },

    onPush: function(fn) {
      if (window.pusher) {
        channel = window.pusher.subscribe('@' + this.props.username);
        channel.bind_all(fn);
      }
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = NotificationsMixin;
  }

  window.NotificationsMixin = NotificationsMixin;

  function reconcileStoriesAndSpinner() {
    if (this.state.stories) {
      this.spinner.stop();

      if (!this.state.stories.length && !this.props.fullPage) {
        this._render = this.render;

        this.render = function() {
          return (
            <ul className="dropdown-menu" style={{ minWidth: '380px', width: '380px' }}>
              <li style={{ overflowY: 'scroll', minHeight: '60px' }}>
                <div className="text-center" style={{ paddingTop: '15px' }}>
                  There don't seem to be any notifications here just yet.
                </div>
              </li>
            </ul>
          );
        }
      } else {
        if (typeof this._render === 'function') {
          this.render = this._render;
          this._render = null;
        }
      }

      // force a re-render
      this.forceUpdate();
    }
  }
})();
