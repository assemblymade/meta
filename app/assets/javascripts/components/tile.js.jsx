module.exports = React.createClass({
  displayName: 'Tile',

  render: function() {
    return (
      <div className="bg-white rounded shadow">
        {this.props.children}
      </div>
    )
  }
})
