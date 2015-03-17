var Avatar = require('../ui/avatar.js.jsx')
var Markdown = require('../markdown.js.jsx')

module.exports = React.createClass({
  displayName: 'Hello',

  render: function() {
    let user = this.props.user
    return (
      <div className="p3 center">
        <div className="py2 mx-auto mb2" style={{width: 100}}>
          <Avatar user={user} size={100} />
        </div>
        <div className="h4 black">
          <a href={user.url}>@{user.username}</a> joined the Assembly community
        </div>

      </div>
    )
  }
})
