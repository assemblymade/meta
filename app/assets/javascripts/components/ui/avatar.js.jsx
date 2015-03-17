var Vignette = require('./vignette.js.jsx')

var Avatar = React.createClass({
  propTypes: {
    size: React.PropTypes.number.isRequired,
    user: React.PropTypes.shape({
            username: React.PropTypes.string,
            avatar_url: React.PropTypes.string
          }).isRequired
  },

  getDefaultProps: function() {
    return {
      size: 24
    }
  },

  render: function() {
    var size = this.props.size
    return (
      <Vignette shape="circle" width={size} height={size} style={this.props.style}>
        <img className="bg-gray-6"
             src={this.avatarUrl()}
             alt={this.altText()}
             width={size}
             height={size}
             style={{
               maxWidth:  size,
               maxHeight: size
              }}/>
      </Vignette>
    )
  },

  avatarUrl: function() {
    if (this.props.avatar_url) {
      return this.props.avatar_url
    }

    if (!this.props.user || !this.props.user.avatar_url || this.props.alwaysDefault) {
      return '/assets/default_avatar.png'
    }

    return this.props.user.avatar_url
  },

  altText() {
    var _ref
    return  (_ref = this.props.user) != null ? _ref.username : void 0
  }
})

module.exports = window.Avatar = Avatar
