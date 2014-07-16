/** @jsx React.DOM */

var Avatar = React.createClass({
  render: function() {
    return <img className="avatar img-circle" height="24" src={this.avatarUrl()} width="24" />
  },

  avatarUrl: function() {
    if (this.props.user && !this.props.alwaysDefault) {
      return this.props.user.avatar_url + '?s=' + 48
    } else {
      return '/assets/avatars/default.png'
    }
  }
})
