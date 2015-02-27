const Avatar = require('./ui/avatar.js.jsx')

var User = React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired
  },

  render() {
    const user = this.props.user
    return <a className="block" href={user.url} title={user.username}>
      <Avatar user={user} />
    </a>
  }
})

module.exports = User
