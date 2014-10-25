/** @jsx React.DOM */

(function() {
  var NewsFeedItem = require('./news_feed_item.js.jsx')

  var NewsFeed = React.createClass({
    fetchMoreNewsFeedItems: function(e) {
      this.setState({
        page: this.state.page + 1
      }, function() {
        window.xhr.get(
          window.location + '?page=' + this.state.page,
          this._handleMoreNewsFeedItems
        );
      }.bind(this));
    },

    getInitialState: function() {
      return {
        news_feed_items: this.props.news_feed_items,
        page: (window.parseUri(window.location).queryKey.page || 1)
      };
    },

    render: function() {
      return (
        <div>
          {this.renderNewsFeedItems()}
          <div className="mb4">
            <a href="javascript:void(0);"
                onClick={this.fetchMoreNewsFeedItems}
                className="btn btn-default btn-block">
              Load more
            </a>
          </div>
        </div>
      );
    },

    renderLeftNewsFeedItems: function() {
      return this.partitionedNewsFeedItems()[0].reverse().map(function(item) {
        item.key = item.id;
        return NewsFeedItem(item);
      });
    },

    renderRightNewsFeedItems: function() {
      return this.partitionedNewsFeedItems()[1].reverse().map(function(item) {
        item.key = item.id;
        return NewsFeedItem(item);
      });
    },

    partitionedNewsFeedItems: function() {
      return _.partition(this.state.news_feed_items, function(item) {
        return this.state.news_feed_items.indexOf(item) % 2 == 0
      }.bind(this));
    },

    renderNewsFeedItems: function() {
      return this.state.news_feed_items.map(function(item) {
        item.key = item.id;
        return NewsFeedItem(item);
      });
    },

    renderEmpty: function() {
      return (
        <div className="well text-center">
          There hasn't been any activity on this product yet. Why not <a href="#">start some tasks</a>?
        </div>
      );
    },

    _handleMoreNewsFeedItems: function(err, results) {
      if (err) {
        return console.log(error);
      }

      var newItems;
      try {
        newItems = JSON.parse(results);
      } catch (e) {
        return console.log(e);
      }

      this.setState(React.addons.update(
        this.state, {
          news_feed_items: { $push: newItems }
        }
      ));
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeed;
  }

  window.NewsFeed = NewsFeed;
})();
