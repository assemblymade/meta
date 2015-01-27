var PostListItem = require('./post_list_item.js.jsx');
var ProductStore = require('../../stores/product_store');

var PostList = React.createClass({
  displayName: 'PostList',

  propTypes: {
    posts: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <div className="row mt0">
        <div className="col-xs-12">
          {this.renderPosts()}
        </div>
      </div>
    );
  },

  renderPosts: function() {
    var posts = this.props.posts;

    if (!posts.length) {
      var product = ProductStore.getProduct().name;

      return [
        <h4 className="gray-2" key="heading">
          There don't seem to be any posts here
        </h4>,

        <p key="explanation">
          {"Blog posts by " + product + "'s partners will appear here just as soon as they're written."}
        </p>
      ];
    }

    return _.map(posts, function(post) {
      return <PostListItem post={post} key={'post-list-item-' + post.id} />;
    });
  }
});

module.exports = PostList;
