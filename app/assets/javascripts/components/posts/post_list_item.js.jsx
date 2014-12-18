var Avatar = require('../avatar.js.jsx');
var Icon = require('../icon.js.jsx');
var ListItemMixin = require('../../mixins/list_item_mixin.js.jsx');
var Love = require('../love.js.jsx');

var PostListIem = React.createClass({
  displayName: 'PostListItem',

  propTypes: {
    post: React.PropTypes.object.isRequired
  },

  /**
   * ListItemMixin: this.renderComments({Number: count})
   *                this.renderLove({String: news_feed_item_id})
   *                this.renderTags({[Object: tag]})
   */
  mixins: [ListItemMixin],

  render: function() {
    var post = this.props.post;

    return (
      <div className="bg-white rounded shadow mb2">
        <div className="px3">
          {this.renderTitle()}
          {this.renderSummary()}
        </div>

        <div className="px3 mb1 mt0 gray-dark">
          {this.renderComments(post.comments_count)}
          {this.renderTags(post.marks)}
        </div>
        {this.renderLove(this.props.post.news_feed_item_id)}
        {this.renderUser()}
      </div>
    );
  },

  renderSummary: function() {
    var post = this.props.post;

    if (post.summary) {
      return (
        <div className="h5 mt0 mb2 gray-dark">
          {post.summary}
        </div>
      );
    }
  },

  renderTitle: function() {
    var post = this.props.post;

    return (
      <div className="h4 mb1 mt0" style={{ paddingTop: '1rem' }}>
        <a href={post.url} className="black">
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
