var Avatar = require('../avatar.js.jsx')

module.exports = React.createClass({
  displayName: 'NewsFeedItemIntroduction',

  propTypes: {
    user: React.PropTypes.object.isRequired,
    intro: React.PropTypes.string.isRequired,
  },

  render: function() {
    var user = this.props.user

    return (
      <div className="p3">
        <a className="h3 block bold mt0 mb3 blue" href={user.url}>
          <div className="mb2">
            <Avatar user={user} size={96} />
          </div>
          {user.username}
        </a>
        <div class="gray-darker">
          {this.props.intro}
        </div>
      </div>
    )
  }
})
