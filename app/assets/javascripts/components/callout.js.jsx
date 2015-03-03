var Callout = React.createClass({
  render: function() {
    return (
      <div className="flex flex-stretch bg-white shadow border border-gray-5 mb3 rounded">
        <div className="h2 white bold bg-yellow rounded-left center py3" style={{ minWidth: '8rem' }}>
          <Icon icon="app-coin" />
        </div>
        <div className="flex-auto">
          {this.props.children}
        </div>
      </div>
    )
  }
});

module.exports = window.Callout = Callout;
