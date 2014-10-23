(function() {
  var NewsFeedBountyItem = React.createClass({
    propTypes: {
      bounty: React.PropTypes.object.isRequired
    },

    render: function() {
      var bounty = this.props.bounty;

      return (
        <a href={bounty.url} className="h4 mt0 mb0 block" style={{ color: '#333' }}>
          <strong className="text-coins">
            <span className="icon icon-app-coin"></span>
            {' '}
            <span>{numeral(bounty.value).format('0,0')}</span>
          </strong>
          {' '}
          {bounty.title}
          {' '}
          <span className="text-muted">#{bounty.number}</span>
        </a>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedBountyItem;
  }
})();
