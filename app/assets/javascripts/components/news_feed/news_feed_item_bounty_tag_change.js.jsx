var Avatar = require('../ui/avatar.js.jsx');
var Icon = require('../icon.js.jsx');
var NewsFeedItemEvent = require('./news_feed_item_event.js.jsx');

var NewsFeedBountyItemTagChange = React.createClass({
  displayName: 'NewsFeedBountyItemTagChange',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    body_sanitized: React.PropTypes.string.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    // TODO: The Event::TagChange body needs to be serialized as JSON
    // this is also a bug in the normal view, and one that's bumping the
    // timestamp down below the last comment

    return (
      <NewsFeedItemEvent>
        <a href={actor.url}>
          <Avatar user={actor} style={{ display: 'inline-block' }} /> {actor.username}
          {' '}<span style={{ fontWeight: 400 }}>changed the tags.</span>
        </a>
      </NewsFeedItemEvent>
    );
  }
});

module.exports = NewsFeedBountyItemTagChange;
