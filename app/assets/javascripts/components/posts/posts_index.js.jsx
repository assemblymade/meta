/** @jsx React.DOM */

(function() {
  var PostList = require('./post_list.js.jsx');
  var PostsStore = require('../../stores/posts_store');
  var ProductStore = require('../../stores/product_store');

  var PostsIndex = React.createClass({
    displayName: 'PostsIndex',
    propTypes: {
      initialPosts: React.PropTypes.array.isRequired
    },

    componentDidMount: function() {
      PostsStore.addChangeListener(this.getPosts);
    },

    getDefaultProps: function() {
      var product = ProductStore.getProduct();

      if (!product.slug) {
        console.warn('No product slug found when initializing PostsIndex. Has the ProductStore been initialized?');
      }

      return {
        initialPosts: PostsStore.getPosts(product.slug),
        product: product
      };
    },

    getInitialState: function() {
      return {
        posts: this.props.initialPosts
      };
    },

    getPosts: function() {
      this.setState({
        posts: PostsStore.getPosts(this.props.product.slug)
      });
    },

    render: function() {
      return (
        <div className="col-md-9 col-xs-9">
          {this.renderPosts()}
        </div>
      );
    },

    renderPosts: function() {
      var posts = this.state.posts;
      var product = this.props.product;

      if (!posts.length) {
        return [
          <h4 className="text-muted">
            There don't seem to be any posts here
          </h4>,

          <p>
            {"Blog posts by " + product.name + "'s partners will appear here just as soon as they're written."}
          </p>
        ];
      }

      return <PostList posts={posts} />;
    },
  });

  if (typeof module !== 'undefined') {
    module.exports = PostsIndex;
  }

  window.PostsIndex = PostsIndex;
})();
