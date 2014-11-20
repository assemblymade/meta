/** @jsx React.DOM */

var NewsFeedMixin = {
  eagerlyFetchMoreNewsFeedItems: function(e) {
    this.setState({
      disableLoadMoreButton: true,
      page: this.state.page + 1
    }, function() {
      var url = window.location.pathname + '?page=' + this.state.page;

      if (this.state.filter) {
        url += '&filter=' + this.state.filter;
      }

      window.xhr.get(
        url,
        this._handleMoreNewsFeedItems
      );
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
            distanceFromTop - self.previousDistance > 3000) {
          self.eagerlyFetchMoreNewsFeedItems();
          self.previousDistance = distanceFromTop;
          self.farthestTraveled = distanceFromTop;
        }
      });
    }
  },

  _handleMoreNewsFeedItems: function(err, results) {
    if (err) {
      return console.log(err);
    }

    var newItems;
    try {
      newItems = JSON.parse(results);
    } catch (e) {
      return console.log(e);
    }

    if (newItems && newItems.length) {
      this.setState(React.addons.update(
        this.state, {
          items: { $push: newItems },
          loading: { $set: false }
        }
      ));
    }
  }
};

module.exports = NewsFeedMixin;
