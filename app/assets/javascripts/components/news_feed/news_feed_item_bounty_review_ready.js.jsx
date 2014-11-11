/** @jsx React.DOM */

module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyReviewReady',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    award_url: React.PropTypes.string,
    id: React.PropTypes.string.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <div className="timeline-item">
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-blue">
              <span className="icon icon-document"></span>
            </div>
          </div>

          <div className="media-body">
            {this.renderAwardButtons()}

            <div className="media-heading omega">
              <a href={actor.url}>{actor.username}</a>
              {' '} submitted work for review
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderAwardButtons: function() {
    var actor = this.props.actor;
    var awardUrl = this.props.award_url;
    var id = this.props.id;

    if (awardUrl) {
      return (
        <div className="btn-group pull-right">
          <a className="btn btn-default btn-xs"
              href={awardUrl + '?event_id=' + id}
              data-method="patch"
              data-confirm={'Are you sure you want to award this task to @' + actor.username + '?'}>
            Award
          </a>
          <a className="btn btn-primary btn-xs"
              href={awardUrl + '?event_id=' + id + '&close=true'}
              data-method="patch"
              data-confirm={'Are you sure you want to award this task to @' + actor.username + '?'}>
            Award and close
          </a>
        </div>
      );
    }
  }
});
