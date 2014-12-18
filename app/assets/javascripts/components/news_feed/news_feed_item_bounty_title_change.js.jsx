var Icon = require('../icon.js.jsx');

var NewsFeedItemBountyTitleChange = React.createClass({
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    target: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <div className="timeline-item">
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-yellow">
              <Icon icon="pencil" />
            </div>
          </div>

          <div className="media-body">
            <div className="media-heading omega">
              <a href={actor.url}>{actor.username}</a>
              {' '} renamed this from {this.props.old_title}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItemBountyTitleChange;
}
