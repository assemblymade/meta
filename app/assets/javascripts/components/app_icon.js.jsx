var Thumbnail = require('./thumbnail.js.jsx')
var Vignette = require('./ui/vignette.js.jsx')

var AppIcon = React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired,
    size: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      size: 24
    }
  },

  render: function() {
    var logoUrl = this.props.app.logo_url
    var size = this.props.size

    return (
      <Vignette shape="rounded" width={size} height={size}>
        <Thumbnail src={logoUrl} width={size} height={size} />
      </Vignette>
    )
  }

})

window.AppIcon = module.exports = AppIcon
