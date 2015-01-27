var Vignette = React.createClass({

  propTypes: {
    shape: React.PropTypes.oneOf(['square', 'rounded', 'circle']).isRequired,
    shade: React.PropTypes.oneOf(['dark', 'light']).isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      shape: 'square',
      shade: 'dark'
    }
  },

  render() {
    var cs = React.addons.classSet({
      'vignette': true,
      'vignette--rounded': this.props.shape === 'rounded',
      'vignette--circle':  this.props.shape === 'circle',
      'vignette--dark':    this.props.shade === 'dark',
      'vignette--light':   this.props.shade === 'light'
    })

    var size = {
      width:  this.props.width,
      height: this.props.height
    }

    return <div className={cs} style={size}>
      {this.props.children}
    </div>
  }
})

module.exports = Vignette
