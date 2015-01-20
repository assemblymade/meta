var AppIcon = React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired,
    size: React.PropTypes.number,
    style: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      size: 24,
      style: {}
    }
  },

  render: function() {
    var logoUrl = this.props.app.logo_url
    var size = this.props.size
    var style = this.props.style

    return <img className="app-icon"
        src={logoUrl}
        height={size}
        width={size}
        style={style} />
  }

})

window.AppIcon = module.exports = AppIcon
