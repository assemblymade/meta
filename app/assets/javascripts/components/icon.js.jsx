var Icon = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    style: React.PropTypes.object
  },

  render: function() {
    var icon = this.props.icon.toString()
    var style = this.props.style
    var classes = ['fa', 'fa-' + icon].join(' ')

    return <span className={classes} style={style} />
  }
})

window.Icon = module.exports = Icon;
