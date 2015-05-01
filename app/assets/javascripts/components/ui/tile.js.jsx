var Tile = React.createClass({
  render: function() {
    return <div className="bg-white rounded shadow border border-gray-5">
      {this.props.children}
    </div>
  }
})

module.exports = Tile
