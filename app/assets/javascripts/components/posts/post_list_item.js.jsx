/** @jsx React.DOM */

var Avatar = require('../avatar.js.jsx');
var Love = require('../love.js.jsx');

var PostListIem = React.createClass({
  displayName: 'PostListItem',

  propTypes: {
    post: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="bg-white rounded shadow mb2">
        <div className="p3">
          {this.renderTitle()}
          {this.renderSummary()}
        </div>
        {this.renderTags()}
        {this.renderUser()}
      </div>
    );
  },

  renderTags: function() {
    var post = this.props.post;

    if (post.tags && post.tags.length) {
      var tags = _.map(post.tags, function(tag) {
        return (
          <a className="caps gray-dark mr1" href={tag.url}>
            #{tag.name.toLowerCase()}
          </a>
        );
      });


      return (
        <div className="px3 py2 border-top mb0 mt0">
          {tags}
        </div>
      );
    }
  },

  renderSummary: function() {
    var post = this.props.post;

    return (
      <div className="h5 mt0 mb1 gray-dark">
        {post.summary}
      </div>
    );
  },

  renderTitle: function() {
    var post = this.props.post;

    return (
      <div className="h4 mt0 mb1">
        <a href={post.url} className="bold">
          {post.title}
        </a>
      </div>
    );
  },

  renderUser: function() {
    var post = this.props.post;
    var user = post.user;

    return (
      <div className="h6 px3 py2 b0 mt0 border-top">
        <Avatar user={user} size={24} style={{ display: 'inline-block' }} />

        <span className="gray-dark ml2">
          <a href={user.url}>@{user.username}</a> wrote this post {moment(post.created_at).fromNow()}
        </span>
      </div>
    );
  }
});

module.exports = PostListIem;
