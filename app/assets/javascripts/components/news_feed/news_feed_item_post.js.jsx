(function() {

  module.exports = React.createClass({
    displayName: 'NewsFeedItemPost',

    propTypes: {
      post: React.PropTypes.object.isRequired,
      user: React.PropTypes.object.isRequired,
      product: React.PropTypes.object.isRequired
    },

    render: function() {
      var post = this.props.post
      var user = this.props.user
      var product = this.props.product

      return (
        <div className="p3">
          <a href={post.url} className="block h4 mt0 mb2 black">
            {post.title}
          </a>

          <div className="clearfix gray h6 mt0 mb2">
            <div className="left mr1">
              <Avatar user={user} size={18} />
            </div>
            <div className="overflow-hidden">
              Created by
              {' '}
              <a className="gray" href={user.url}>{user.username}</a>
            </div>
          </div>

          <div className="gray-darker" dangerouslySetInnerHTML={{__html: post.markdown_body}} />

          <a className="btn btn-default btn-sm" href={product.url}>Read more</a>
        </div>
      )
    }
  })

})()
