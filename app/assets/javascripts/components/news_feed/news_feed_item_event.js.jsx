module.exports = React.createClass({
  displayName: 'NewsFeedItemEvent',
  propTypes: {
    id: React.PropTypes.string,
    timestamp: React.PropTypes.string
  },

  render: function() {
    const {children, timestamp, id} = this.props
    return (
      <div className="clearfix visible-hover-wrapper" id={id}>
        <div className="left relative px1">
          <div className="block circle bg-white border absolute" style={{width: '1.5rem', height: '1.5rem', borderWidth: 3}}>&nbsp;</div>
        </div>
        <div className="right ml2 h6 gray-2 visible-hover">
          {moment(timestamp).fromNow()}
        </div>
        <div className="overflow-hidden ml4 h6 gray-2">
          {children}
        </div>
      </div>
    );
  }
});
