var Tile = React.createClass({
  getDefaultProps: function() {
    return {
      padding: 0,
    };
  },

  render: function() {
    var padding = (this.props.padding === 0) ? null : " p" + this.props.padding;
    return <div className={"bg-white rounded shadow border border-gray-5" + padding}>
      {this.props.children}
    </div>
  }
})

module.exports = Tile
