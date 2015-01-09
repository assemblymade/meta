var Avatar = require('./avatar.js.jsx')

module.exports = React.createClass({
  displayName: 'AvatarWithUsername',

  propTypes: {
    size: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      size: 24
    }
  },

  render: function() {
    return (
      <span>
        <div className="left mr1">
          <Avatar user={this.props.user} size={this.props.size} />
        </div>
        <span className="bold">{this.props.user.username}</span>
      </span>
    )
  }
})
