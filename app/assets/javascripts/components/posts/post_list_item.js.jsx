var Avatar = require('../ui/avatar.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var ListItemMixin = require('../../mixins/list_item_mixin.js.jsx');
var Heart = require('../heart.js.jsx');
var NewsFeedItemModal = require('../news_feed/news_feed_item_modal.js.jsx');

var PostListIem = React.createClass({
  displayName: 'PostListItem',

  propTypes: {
    post: React.PropTypes.object.isRequired
  },

  /**
   * ListItemMixin: this.onModalHidden()
   *                this.renderComments({Number: count})
   *                this.renderLove({String: news_feed_item_id})
   *                this.renderTags({[Object: tag]})
   *                this.showModal()
   */
  mixins: [ListItemMixin],

  getInitialState: function() {
    return {
      modalShown: false
    };
  },

  render: function() {
    var post = this.props.post;

    return (
      <div className="bg-white rounded shadow mb2">
        <div className="px3">
          {this.renderTitle()}
          {this.renderSummary()}
        </div>

        <div className="px3 mb1 mt0 gray-2">

          {this.renderComments(post.comments_count)}
          {this.renderTags(post.marks)}
        </div>
        <div className="py3">{this.renderLove(this.props.post.news_feed_item_id)}</div>
        {this.renderUser()}
        {this.renderModal()}
      </div>

    );
  },

  renderModal: function() {
    if (this.state.modalShown) {
      var post = this.props.post;
      var newsFeedItemid = post.news_feed_item_id;

      var item = {
        heartable_id: newsFeedItemid,
        id: newsFeedItemid,
        product: post.product,
        target: post,
        user: post.user
      };

      return <NewsFeedItemModal item={item} onHidden={this.onModalHidden} />;
    }
  },

  renderSummary: function() {
    var post = this.props.post;

    if (post.summary) {
      return (
        <div className="h5 mt0 mb2 gray-2">
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
      <div className="h6 px3 py2 b0 mt0 border-top clearfix">
        <div className="left mr2">
          <Avatar user={user} size={24} />
        </div>

        <div className="overflow-hidden gray-2">
          <a href={user.url}>@{user.username}</a> wrote this post {moment(post.created_at).fromNow()}
        </div>
      </div>
    );
  }
});

module.exports = PostListIem;
