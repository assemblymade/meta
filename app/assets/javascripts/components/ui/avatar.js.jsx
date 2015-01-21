var Avatar = React.createClass({
  propTypes: {
    avatar_url: React.PropTypes.string,
    size: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
          ]),
    user: React.PropTypes.shape({
            username: React.PropTypes.string,
            avatar_url: React.PropTypes.string
          }),
    style: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      size: 24,
      style: {}
    }
  },

  render: function() {
    var username, _ref

    var size = this.props.size.toString()
    var username =  (_ref = this.props.user) != null ? _ref.username : void 0

    return <img className="avatar"
        src={this.avatarUrl()}
        height={size}
        width={size}
        style={this.props.style}
        alt={username} />
  },

  avatarUrl: function() {
    if (this.props.avatar_url) {
      return this.props.avatar_url
    }

    if (!this.props.user || !this.props.user.avatar_url || this.props.alwaysDefault) {
      return '/assets/avatars/default.png'
    }

    return this.props.user.avatar_url
  }
})

module.exports = window.Avatar = Avatar
