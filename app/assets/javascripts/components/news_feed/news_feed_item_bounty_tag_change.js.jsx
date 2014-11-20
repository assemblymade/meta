/** @jsx React.DOM */

var Avatar = require('../avatar.js.jsx');
var Icon = require('../icon.js.jsx');

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
      <div className="timeline-item">
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-gray">
              <Icon icon="tags" />
            </div>
          </div>

          <div className="media-body">
            <div className="media-heading omega">
              <a href={actor.url}>
                <Avatar user={actor} style={{ display: 'inline-block' }} /> {actor.username}
                {' '}<span style={{ fontWeight: 400 }}>changed the tags.</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = NewsFeedBountyItemTagChange;
