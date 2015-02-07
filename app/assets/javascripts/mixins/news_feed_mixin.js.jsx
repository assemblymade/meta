var Dispatcher = require('../dispatcher');
var ActionTypes = require('../constants').ActionTypes;
var NewsFeedItemsActionCreators = require('../actions/news_feed_items_action_creators');

var NewsFeedMixin = {
  eagerlyFetchMoreNewsFeedItems: function(e) {
    this.setState({
      disableLoadMoreButton: true,
      page: (this.state.page || 1) + 1
    }, function() {
      var url = window.location.pathname + '?page=' + this.state.page;

      if (this.state.filter) {
        url += '&filter=' + this.state.filter;
      }

      NewsFeedItemsActionCreators.requestNextPage({})
    }.bind(this));
  },

  initializeEagerFetching: function() {
    this.previousDistance = 0;
    this.farthestTraveled = 0;

    var self = this;
    var body = $(document);

    if (body) {
      body.scroll(function(e) {
        var distanceFromTop = document.body.scrollTop;

        if (distanceFromTop > self.farthestTraveled &&
            distanceFromTop - self.previousDistance > 1500) {
          self.eagerlyFetchMoreNewsFeedItems();
          self.previousDistance = distanceFromTop;
          self.farthestTraveled = distanceFromTop;
        }
      });
    }
  }
};

module.exports = NewsFeedMixin;
