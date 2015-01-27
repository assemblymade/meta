var Avatar = require('./ui/avatar.js.jsx')
var Markdown = require('./markdown.js.jsx')

var Introduction = React.createClass({

  propTypes: {
    introduction: React.PropTypes.shape({
      user: React.PropTypes.object,
      product: React.PropTypes.object,
      bio: React.PropTypes.string
    }).isRequired
  },

  render: function() {
    var introduction = this.props.introduction
    var user = introduction.user
    var product = introduction.product

    return (
      <div className="p3 center">
        <div className="h4 black">Welcome @{user.username}</div>
        <div className="gray-2">to {product.name}</div>

        <div className="py2 mx-auto mb2" style={{width: 144}}>
          <Avatar user={user} size={144} />
        </div>

        <div className="bold gray-1">{user.username}:</div>

        <div className="gray-1">
          <Markdown content={introduction.bio} />
        </div>
      </div>
    )
  }
})

module.exports = window.Introduction = Introduction
