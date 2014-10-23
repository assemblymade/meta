(function() {
  var NewsFeedBountyItem = React.createClass({
    propTypes: {
      bounty: React.PropTypes.object.isRequired
    },

    render: function() {
      var bounty = this.props.bounty;

      return (
        <div className="ml1 col col-10" style={{ 'font-size': '24px', 'line-height': '1em' }}>
          <span className="text-coins text-weight-bold">
            <span className="icon icon-app-coin"></span>
            <span>{numeral(bounty.value).format('0,0')}</span>
          </span>
          <span>
            &nbsp;<a href={bounty.url} style={{color: '#333'}}>
              {bounty.title}
              <span style={{color: '#d3d3d3'}}>&nbsp;#{bounty.number}</span>
            </a>
          </span>
          <div className="clearfix">
          </div>
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedBountyItem;
  }
})();
