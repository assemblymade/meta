/** @jsx React.DOM */

(function() {
  var NewsFeedItem = require('./news_feed_item.js.jsx')

  var NewsFeed = React.createClass({
    render: function() {
      return (
        <div className="container mt2 mb4">
          <div className="row">
            <div className="col-md-8 col-md-offset-2 col-xs-12">
              {this.renderNewsFeedItems()}
            </div>
          </div>
        </div>
      )
    },

    renderNewsFeedItems: function() {
      if(!this.props.news_feed_items) {
        return this.renderEmpty()
      }

      return this.props.news_feed_items.map(function(item) {
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
