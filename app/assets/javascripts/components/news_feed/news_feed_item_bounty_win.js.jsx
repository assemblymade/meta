var NewsFeedItemBountyWin = React.createClass({
  displayName: 'NewsFeedItemBountyWin',
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    target: React.PropTypes.object.isRequired
  },

  render: function() {
    var actor = this.props.actor;
    var target = this.props.target;

    return (
      <div className="timeline-item">
        <div className="media">
          <div className="pull-left">
            <div className="marker marker-green">
              <span className="icon icon-star"></span>
            </div>
          </div>

          <div className="media-body">
            <div className="media-heading omega">
              <a href={target.url}>{target.username}</a>
              {' '} was awarded this by {' '}

              <a href={actor.url}>{actor.username}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = NewsFeedItemBountyWin;
