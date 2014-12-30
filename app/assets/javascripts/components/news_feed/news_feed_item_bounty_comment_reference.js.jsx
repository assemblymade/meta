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
      <div className="timeline-item" id={this.props.id}>
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-blue">
              <span className="icon icon-arrow-right"></span>
            </div>
          </div>

          <div className="media-body">
            <div className="media-heading omega">
              <a href={actor.url}>{actor.username}</a>
              {' '} mentioned this in {' '}
              <a href={targetUrl} title={targetTitle}>{targetTitle}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
