var PixelDensity = 2

var Thumbnail = React.createClass({

  propTypes: {
    src: React.PropTypes.string.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  getDefaultProps: function() {
    var defaults = {}

    var firesizeEl = document.getElementsByName('firesize-url')
    if (firesizeEl[0]) {
      defaults.basePath = firesizeEl[0].content
    }
    return defaults
  },

  render: function() {
    var width = this.props.width
    var height = this.props.height
    return <img {...this.props}
                src={this.src()}
                width={width}
                height={height} />
  },

  src() {
    var width = this.props.width * PixelDensity
    var height = this.props.height * PixelDensity
    return this.props.basePath + '/' + width + 'x' + height + '/g_center/' + this.props.src
  }
})

module.exports = Thumbnail
