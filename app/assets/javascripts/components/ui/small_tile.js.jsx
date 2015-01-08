var SmallTile = React.createClass({
  displayName: 'SmallTile',

  render: function() {
    return (
      <div className="tile tile-small">
        {this.props.children}
      </div>
    );
  }
});

module.exports = SmallTile;
