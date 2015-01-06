var Icon = require('../icon.js.jsx');
var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

var NewsFeedItemBountyTitleChange = React.createClass({
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    target: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <NewsFeedItemEvent>
        <a href={actor.url}>{actor.username}</a>
        {' '} renamed this from {this.props.old_title}
      </NewsFeedItemEvent>
    );
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItemBountyTitleChange;
}
