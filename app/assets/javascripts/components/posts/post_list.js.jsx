var PostListItem = require('./post_list_item.js.jsx');
var ProductStore = require('../../stores/product_store');

var PostList = React.createClass({
  displayName: 'PostList',

  propTypes: {
    posts: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <div className="sm-col-12">
        {this.renderPosts()}
      </div>
    );
  },

  renderPosts: function() {
    var posts = this.props.posts;

    if (!posts.length) {
      var product = ProductStore.getProduct().name;

      return (
        <div className="bg-white border rounded p3 mb3 center" key="explanation">
          <div className="h2 mt2 gray-3">
            <Icon icon="edit" />
          </div>
          <h3 className="light mt2">No posts here...yet!</h3>
          <p className="gray-2">{"Blog posts by " + ProductStore.getProduct().name + "'s partners will appear here as soon as they're written."}</p>
        </div>
      );
    }

    return _.map(posts, function(post) {
      return <PostListItem post={post} key={'post-list-item-' + post.id} />;
    });
  }
});

module.exports = PostList;
