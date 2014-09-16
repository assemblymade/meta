/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var NewsFeedStore = require('../stores/news_feed_store');
var NewsFeedUsersStore = require('../stores/news_feed_users_store');
var update = require('react/lib/update');

(function() {
  var MORE_STORIES_LENGTH = 20;
  var NF = CONSTANTS.NEWS_FEED;

  var NewsFeedMixin = {
    componentDidMount: function() {
      var target = this.refs.spinner && this.refs.spinner.getDOMNode();
      var opts = this.spinnerOptions || {
        lines: 10,
        length: 8,
        radius: 10
      };

      var spinner = this.spinner = new Spinner(opts).spin();

      target.appendChild(spinner.el);
      NewsFeedStore.addChangeListener(this.getStories);
    },

    componentWillMount: function() {
      this.fetchNewsFeed();

      this.onPush(function() {
        this.fetchNewsFeed();
      }.bind(this));
    },

    fetchNewsFeed: _.debounce(function() {
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
      var newStories = NewsFeedStore.getStories();

      this.setState({
        stories: newStories,
        actors: NewsFeedUsersStore.getUsers(),
        showMore: (newStories.length - oldStoriesCount === MORE_STORIES_LENGTH)
      }, function() {
        if (self.state.stories) {
          self.spinner.stop();

          if (!self.state.stories.length && !self.props.fullPage) {
            self._render = self.render;

            self.render = function() {
              return (
                <ul className="dropdown-menu" style={{ 'min-width': '380px', width: '380px' }}>
                  <li style={{ 'overflow-y': 'scroll', 'min-height': '60px' }}>
                    <div className="text-center" style={{ 'padding-top': '15px' }}>
                      There don't seem to be any notifications here just yet.
                    </div>
                  </li>
                </ul>
              );
            }
          } else {
            if (typeof self._render === 'function') {
              self.render = self._render;
              self._render = null;
            }
          }

          // force a re-render
          self.forceUpdate();
        }
      });
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
    module.exports = NewsFeedMixin;
  }

  window.NewsFeedMixin = NewsFeedMixin;
})();
