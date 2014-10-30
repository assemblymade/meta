(function() {

  var Avatar = require('../avatar.js.jsx')

  module.exports = React.createClass({
    displayName: 'NewsFeedItemIntroduction',

    propTypes: {
      introduction: React.PropTypes.object.isRequired
    },

    render: function() {
      var introduction = this.props.introduction
      var product = this.props.product
      var user = this.props.user

      return (
        <div className="p3 clearfix">
          <div className="left">
            <AppIcon app={this.props.product} size={42} />
          </div>
          <div className="overflow-hidden p2">
            <a href={product.url}>{product.name}</a>
          </div>

          <div className="mt2 mb2 text-center">
            <a href={user.url} className="block">
              <Avatar user={user} size={96} style={{ display: 'inline !important' }} />
              <span className="block">{user.username}</span>
            </a>

            <div className="overflow-hidden">
              <div className="h4 mt0 mb0">{introduction.bio}</div>
            </div>
          </div>

          <a className="text-small" href={introduction.url}>Read more</a>
        </div>
      )
    }
  })

})()
