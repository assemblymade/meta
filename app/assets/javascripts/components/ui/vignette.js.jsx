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
      maxWidth:  this.props.width,
      maxHeight: this.props.height
    }

    return <div className={cs} style={_.extend(size, this.props.style)}>
      {this.props.children}
    </div>
  }
})

module.exports = Vignette
