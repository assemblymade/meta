/** @jsx React.DOM */

//= require spin

(function() {
  window.NewsFeedMixin = {
    componentDidMount: function() {
      var target = this.refs.spinner.getDOMNode();
      var spinner = this.spinner = new Spinner({
        lines: 11,
        length: 30,
        radius: 55
      }).spin();

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
})();
