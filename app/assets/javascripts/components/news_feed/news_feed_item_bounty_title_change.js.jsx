var Icon = require('../ui/icon.js.jsx');
var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

var NewsFeedItemBountyTitleChange = React.createClass({
  propTypes: {
    actor: React.PropTypes.shape({
      url: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired,
    }).isRequired,
    body: React.PropTypes.string.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <NewsFeedItemEvent timestamp={this.props.timestamp}>
        <a className="bold black" href={actor.url}>{actor.username}</a>
        {' '} renamed this from <span className="black">&ldquo;{this.props.body}&rdquo;</span>
      </NewsFeedItemEvent>
    );
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItemBountyTitleChange;
}
