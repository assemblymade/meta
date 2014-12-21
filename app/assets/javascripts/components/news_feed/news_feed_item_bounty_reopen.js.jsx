module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyReopen',
  propTypes: {
    actor: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <div className="timeline-item" id={this.props.id}>
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-green">
              <span className="icon icon-disc"></span>
            </div>
          </div>

          <div className="media-body">
            <div className="media-heading omega">
              Reopened by

              {' '}<a href={actor.url}>{actor.username}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
