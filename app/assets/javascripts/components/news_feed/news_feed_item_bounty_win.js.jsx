var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyWin',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    target: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;
    var target = this.props.target;

    return (
      <div>
        <a href={target.url} className="black bold">{target.username}</a>
        {' '} was awarded this by {' '}

        <a href={actor.url} className="black bold">{actor.username}</a>
      </div>
    );
  }
});
