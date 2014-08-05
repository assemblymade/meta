/** @jsx React.DOM */

var NewsFeedStore = require('../stores/news_feed_store');
var NewsFeedUsersStore = require('../stores/news_feed_users_store');

(function() {
  var NewsFeedMixin = {
    componentDidMount: function() {
      var target = this.refs.spinner.getDOMNode();
      var opts = this.spinnerOptions || {
        lines: 13,
        length: 30,
        radius: 55
      };

      var spinner = this.spinner = new Spinner(opts).spin();

      target.appendChild(spinner.el);
    },

    getStories: function() {
      var self = this;

      this.setState({
        stories: NewsFeedStore.getStories(),
        actors: NewsFeedUsersStore.getUsers()
      }, function() {
        if (self.state.stories.length) {
          self.spinner.stop();
        }
      });
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedMixin;
  }

  window.NewsFeedMixin = NewsFeedMixin;
})();
