/** @jsx React.DOM */

(function() {
  var NewsFeedItem = require('./news_feed_item.js.jsx')

  var NewsFeed = React.createClass({
    getInitialState: function() {
      return {
        news_feed_items: this.props.news_feed_items.reverse()
      }
    },

    render: function() {
      return (
        <div className="container mt2 mb4">
          <div className="row hidden-xs">
            <div className="col-sm-6">
              {this.renderLeftNewsFeedItems()}
            </div>

            <div className="col-sm-6">
              {this.renderRightNewsFeedItems()}
            </div>
          </div>

          <div className="row visible-xs">
            <div className="col-xs-12">
              {this.renderNewsFeedItems()}
            </div>
          </div>
        </div>
      )
    },

    renderLeftNewsFeedItems: function() {
      return this.partitionedNewsFeedItems()[0].reverse().map(function(item) {
        item.key = item.id;
        return NewsFeedItem(item);
      })
    },

    renderRightNewsFeedItems: function() {
      return this.partitionedNewsFeedItems()[1].reverse().map(function(item) {
        item.key = item.id;
        return NewsFeedItem(item);
      })
    },

    partitionedNewsFeedItems: function() {
      return _.partition(this.state.news_feed_items, function(item) {
        return this.state.news_feed_items.indexOf(item) % 2 == 0
      }.bind(this))
    },

    renderNewsFeedItems: function() {
      return _.clone(this.state.news_feed_items).reverse().map(function(item) {
        item.key = item.id;
        return NewsFeedItem(item);
      })
    },

    renderEmpty: function() {
      return (
        <div className="well text-center">
          There hasn't been any activity on this product yet. Why not <a href="#">start some tasks</a>?
        </div>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = NewsFeed;
  }

  window.NewsFeed = NewsFeed;
})();
