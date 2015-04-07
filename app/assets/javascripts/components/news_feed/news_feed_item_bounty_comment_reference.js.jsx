var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyCommentReference',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    target: React.PropTypes.shape({
      target_title: React.PropTypes.string.isRequired,
      target_type: React.PropTypes.string.isRequired,
      target_url: React.PropTypes.string.isRequired
    }).isRequired
  },

  render: function() {
    var actor = this.props.actor;
    var target = this.props.target;
    var targetTitle = target.target_title;
    var targetType = target.target_type;
    var targetUrl = target.target_url;

    return (
      <NewsFeedItemEvent timestamp={this.props.timestamp}>
        <a className="bold black" href={actor.url}>{actor.username}</a>
        {' '} mentioned this in {' '}
        {targetType}{' '}
        <a className="bold black" href={targetUrl} title={targetTitle}>{targetTitle}</a>
      </NewsFeedItemEvent>
    );
  }
});
