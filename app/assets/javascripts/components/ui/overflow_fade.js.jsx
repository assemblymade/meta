var OverflowFade = React.createClass({

  propTypes: {
    dimension: React.PropTypes.oneOf(['horizontal', 'vertical']),
    width: React.PropTypes.string,
    height: React.PropTypes.string,
  },

  render() {
    var fadeStyle = {}
    var dimension = this.props.dimension
    var limit = this.props.limit
    var bgImage

    if (dimension === 'horizontal') {
      fadeStyle = {
        width: '2rem',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0), white 50%)'
      }
    }

    if (dimension === 'vertical') {
      fadeStyle = {
        height: '4rem',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0), white)'
      }
    }

    var fadeCs = React.addons.classSet({
      'absolute': true,
      'top-0 right-0 bottom-0': dimension === 'horizontal',
      'right-0 bottom-0 left-0': dimension === 'vertical',
    })

    return (
      <div className="relative overflow-hidden" style={{width: this.props.width, height: this.props.height}}>
        {this.props.children}
        <div className={fadeCs} style={fadeStyle}></div>
      </div>
    )
  }

})

module.exports = OverflowFade
