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
    var user = post.user;

    return (
      <div className="bg-white rounded shadow mb2">
        <div className="px3 py1">
          <a href={post.url} className="h4 mt2 black block">
            {post.title}
          </a>
          <p className="mb1 h6 gray-2">
            written {moment(post.created_at).fromNow()} by <a href={user.url}>@{user.username}</a>
          </p>

          {this.renderSummary()}
        </div>

        <div className="border-top px3 py2 gray-2">
          <div>
            <div className="inline-block mr2">
              <Heart size="small" heartable_type='NewsFeedItem' heartable_id={this.props.post.news_feed_item_id} />
            </div>
            {this.renderComments(post.comments_count)}
          </div>
          {this.renderTags(post.marks)}
        </div>

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
        <div className="h5 mt2 mb2 gray-1">
          {post.summary}
        </div>
      );
    }
  }
});

module.exports = PostListIem;
