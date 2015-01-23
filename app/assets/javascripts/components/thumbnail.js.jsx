var Thumbnail = React.createClass({

  propTypes: {
    src: React.PropTypes.string.isRequired,
    size: React.PropTypes.number
  },

  getDefaultProps: function() {
    var defaults = {
      size: 100
    }

    var firesizeEl = document.getElementsByName('firesize-url')
    if (firesizeEl[0]) {
      defaults.basePath = firesizeEl[0].content
    }
    return defaults
  },

  render: function() {
    var size = this.props.size;

    return (
      <img src={this.props.basePath + '/' + size + 'x' + size + '/g_center/' + this.props.src} style={{ maxHeight: size }} />
    )
  }
})

module.exports = Thumbnail
