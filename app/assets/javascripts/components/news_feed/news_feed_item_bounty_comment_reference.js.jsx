/** @jsx React.DOM */


module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyCommentReference',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    target_title: React.PropTypes.string.isRequired,
    target_type: React.PropTypes.string.isRequired,
    target_url: React.PropTypes.string.isRequired
  },

  render: function() {
    var actor = this.props.actor;
    var targetTitle = this.props.target_title;
    var targetType = this.props.target_type;
    var targetUrl = this.props.target_url;

    return (
      <div className="timeline-item">
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
              {targetType}{' '}
              <a href={targetUrl} title={targetTitle}>{targetTitle}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
