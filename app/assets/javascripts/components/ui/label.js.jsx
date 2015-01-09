module.exports = React.createClass({
  displayName: 'Label',

  render: function() {
    var style = {
      fontSize: '11px',
      textTransform: 'uppercase'
    }

    return (
      <span className="gray-2 uppercase" style={style}>#{this.props.name}</span>
    )
  }
})
