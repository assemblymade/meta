/** @jsx React.DOM */

var NewsFeedMixin = require('../../mixins/news_feed_mixin.js.jsx');
var NewsFeedTile = require('./news_feed_tile.js.jsx');

var NewsFeedList = React.createClass({
  displayName: 'NewsFeedList',

  propTypes: {
    items: React.PropTypes.array.isRequired
  },

  mixins: [NewsFeedMixin],

  componentDidMount: function() {
    this.initializeEagerFetching();
  },

  getInitialState: function() {
    return {
      items: this.props.items || []
    };
  },

  render: function() {
    return (
      <div className="mxn2" style={{marginTop: '-1rem'}} ref="masonryContainer">
        {this.renderItems()}
      </div>
    )
  },

  renderItems: function() {
    return this.state.items.map(function(item) {
      return (
        <div className="p2" key={item.id}>
          <NewsFeedTile {...item} />
        </div>
      )
    })
  }

});

module.exports = NewsFeedList;

window.NewsFeedList = module.exports
