/** @jsx React.DOM */

var NewsFeedTile = require('./news_feed_tile.js.jsx');
var MasonryMixin = require('../../mixins/masonry_mixin.js')

module.exports = React.createClass({
  displayName: 'NewsFeedList',

  propTypes: {
    items: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <div className="mxn2" ref="masonryContainer">
        {this.renderItems()}
      </div>
    )
  },

  renderItems: function() {
    return this.props.items.map(function(item) {
      return (
        <div className="p2" key={item.id}>
          <NewsFeedTile {...item} />
        </div>
      )
    })
  }

});

window.NewsFeedList = module.exports
