var Callout = React.createClass({
  render: function() {
    return (
      <div className="bg-white shadow border border-gray-5 mb3 clearfix">
        <div className="h2 white bold bg-yellow left" style={{ padding: '2rem 2.5rem' }}>
          <Icon icon="app-coin" />
        </div>
        {this.props.children}
      </div>
    )
  }
});

module.exports = window.Callout = Callout;
