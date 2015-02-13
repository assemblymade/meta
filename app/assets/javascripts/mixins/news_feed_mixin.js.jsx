var Dispatcher = require('../dispatcher');
var ActionTypes = require('../constants').ActionTypes;
var NewsFeedItemsActionCreators = require('../actions/news_feed_items_action_creators');
var Routes = require('../routes');

var NewsFeedMixin = {
  eagerlyFetchMoreNewsFeedItems: function(e) {
    this.setState({
      disableLoadMoreButton: true,
      page: (this.state.page || 1) + 1
    }, function() {
      var url = this.props.url + '/updates';

      NewsFeedItemsActionCreators.requestNextPage({ url: url })
    }.bind(this));
  },

  initializeEagerFetching: function() {
    this.previousDistance = 0;
    this.farthestTraveled = 0;

    var self = this;
    var body = $(document);

    if (body) {
      body.scroll(function(e) {
        var distanceFromTop = $(document).scrollTop();

        if (distanceFromTop > self.farthestTraveled &&
            distanceFromTop - self.previousDistance > 4000) {
          self.eagerlyFetchMoreNewsFeedItems();
          self.previousDistance = distanceFromTop;
          self.farthestTraveled = distanceFromTop;
        }
      });
    }
  }
};

module.exports = NewsFeedMixin;
