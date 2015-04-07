var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyReopen',
  propTypes: {
    actor: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <NewsFeedItemEvent timestamp={this.props.timestamp}>
        Reopened by

        {' '}<a href={actor.url} className="_strong black">{actor.username}</a>
      </NewsFeedItemEvent>
    );
  }
});
