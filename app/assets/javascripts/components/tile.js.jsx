module.exports = React.createClass({
  displayName: 'Tile',

  render: function() {
    return (
      <div className="bg-white rounded shadow mb2">
        {this.props.children}
      </div>
    )
  }
})
