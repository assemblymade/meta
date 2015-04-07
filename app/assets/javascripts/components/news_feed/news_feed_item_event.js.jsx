module.exports = React.createClass({
  displayName: 'NewsFeedItemEvent',
  propTypes: {
    id: React.PropTypes.string
  },

  render: function() {
    return (
      <div className="clearfix" id={this.props.id}>
        <div className="left relative px1">
          <div className="block circle bg-white border absolute" style={{width: '1.5rem', height: '1.5rem', borderWidth: 3}}>&nbsp;</div>
        </div>
        <div className="overflow-hidden ml4 h6 gray-2">
          {this.props.children}
        </div>
      </div>
    );
  }
});
