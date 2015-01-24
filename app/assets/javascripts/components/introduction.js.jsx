var Avatar = require('./ui/avatar.js.jsx')

var Introduction = React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired,
    product: React.PropTypes.object.isRequired,
    target: React.PropTypes.shape({
      bio: React.PropTypes.string.isRequired
    }).isRequired,
    url: React.PropTypes.string.isRequired
  },

  render: function() {
    var user = this.props.user;
    var product = this.props.product;
    var target = this.props.target;

    return (
      <a className="block p3 center" href={this.props.url} onClick={this.handleClick}>
        <div className="h4 black mt0 mb0">Welcome @{user.username}</div>
        <div className="h5 gray-2 mt0 mb0">to {product.name}</div>

        <div className="py2 mx-auto mb2" style={{width: 144}}>
          <Avatar user={user} size={144} />
        </div>

        <div className="h5 bold mt0 mb0 gray-1">{user.username}:</div>

        <div className="gray-1">
          {target.bio}
        </div>
      </a>
    )
  }
})

module.exports = Introduction
