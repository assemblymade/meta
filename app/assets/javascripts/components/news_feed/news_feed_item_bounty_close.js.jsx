module.exports = React.createClass({
  displayName: 'NewsFeedItemBountyClose',
  propTypes: {
    actor: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;

    return (
      <div className="timeline-item">
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-gray">
              <span className="icon icon-disc"></span>
            </div>
          </div>

          <div className="media-body">
            <div className="media-heading omega">
              Closed by

              {' '}<a href={actor.url}>{actor.username}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
