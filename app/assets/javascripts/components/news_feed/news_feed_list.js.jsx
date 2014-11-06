/** @jsx React.DOM */

var NewsFeedItem = require('./news_feed_item.js.jsx');
var MasonryMixin = require('../../mixins/masonry_mixin.js')

module.exports = React.createClass({

  displayName: 'NewsFeedList',

  getInitialState: function() {
    return {
      news_feed_items: this.props.news_feed_items,
    }
  },

  render: function() {
    return (
      <div className="mxn2" ref="masonryContainer">
        {this.renderItems()}
      </div>
    )
  },

  renderItems: function() {
    return this.state.news_feed_items.map(function(item) {
      return (
        <div className="p2" key={item.id}>
          {NewsFeedItem(item)}
        </div>
      )
    })
  }

});

window.NewsFeedList = module.exports
