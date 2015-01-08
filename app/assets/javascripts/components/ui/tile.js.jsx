module.exports = React.createClass({
  displayName: 'Tile',

  propTypes: {

  },

  render: function() {
    return (
      <div className="bg-white rounded shadow mb2">
        {this.props.children}
      </div>
    )
  }
});
