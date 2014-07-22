/** @jsx React.DOM */

var Avatar = React.createClass({
  getDefaultProps: function() {
    return { size: 24 }
  },
  render: function() {
    return <img className="avatar img-circle" src={this.avatarUrl()} height={this.props.size} width={this.props.size} />
  },

  avatarUrl: function() {
    if (this.props.user && !this.props.alwaysDefault) {
      return this.props.user.avatar_url + '?s=' + 48
    } else {
      return '/assets/avatars/default.png'
    }
  }
})

var AvatarLink = React.createClass({
  render: function() {
    return (
      <a href={this.props.user.url} title={'@' + this.props.user.username }>
        <Avatar user={this.props.user} size={this.props.size} />
      </a>
    )
  }
})
