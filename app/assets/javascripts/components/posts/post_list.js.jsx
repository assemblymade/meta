/** @jsx React.DOM */

var PostListItem = require('./post_list_item.js.jsx');

var PostList = React.createClass({
  displayName: 'PostList',

  propTypes: {
    posts: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12">
          {this.renderPosts()}
        </div>
      </div>
    );
  },

  renderPosts: function() {
    var posts = this.props.posts;

    return _.map(posts, function(post, i) {
      return <PostListItem post={post} key={'post-list-item-' + i} />;
    });
  }
});

module.exports = PostList;
