var Tile = require('./tile.js.jsx')
var NewFeedItemComments = require('../news_feed/news_feed_item_comments.js.jsx')

var Discussion = React.createClass({

  propTypes: {
    target: React.PropTypes.element.isRequired
  },

  render: function() {
    var item = this.props.newsFeedItem
    var bounty = this.props.target

    return (
      <Tile>
        {this.props.target}
        <div className="border-top border-gray-5">
          <NewsFeedItemComments commentable={true} item={item} showAllComments={true} />
        </div>
      </Tile>
    )
  }
})

module.exports = window.Discussion = Discussion
