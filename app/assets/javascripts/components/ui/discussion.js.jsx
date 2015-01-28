var Tile = require('./tile.js.jsx')
var NewFeedItemComments = require('../news_feed/news_feed_item_comments.js.jsx')

var Discussion = React.createClass({

  propTypes: {
    newsFeedItem: React.PropTypes.object.isRequired,
    target: React.PropTypes.element.isRequired
  },

  render: function() {
    var item = this.props.newsFeedItem

    return (
      <Tile>
        {this.props.target}
        <div className="border-top border-gray-5">
          <div className="px2 _mq-600_px4">
            <NewsFeedItemComments commentable={true} item={item} showAllComments={true} />
          </div>
        </div>
      </Tile>
    )
  }
})

module.exports = window.Discussion = Discussion
