var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyClose',
  propTypes: {
    actor: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <NewsFeedItemEvent timestamp={this.props.timestamp}>
        Closed by

        {' '}<a href={actor.url} className="bold black">{actor.username}</a>
      </NewsFeedItemEvent>
    );
  }
});
