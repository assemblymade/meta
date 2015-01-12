module.exports = React.createClass({
  displayName: 'Label',

  propTypes: {
    name: React.PropTypes.string.isRequired
  },

  render: function() {
    var style = {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05rem'
    }

    return (
      <span className="gray-2 uppercase" style={style}>#{this.props.name}</span>
    )
  }
})
