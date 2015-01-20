var Tile = React.createClass({
  render: function() {
    return <div className="bg-white rounded shadow">{this.props.children}</div>
  }
})

module.exports = Tile
