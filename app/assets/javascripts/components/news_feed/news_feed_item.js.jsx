(function() {
  var AppIcon = require('../app_icon.js.jsx');
  var Avatar = require('../avatar.js.jsx');
  var Comment = require('../comment.js.jsx');
  var Icon = require('../icon.js.jsx');
  var Markdown = require('../markdown.js.jsx');
  var NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx');
  var NewsFeedItemBountyModal = require('./news_feed_item_bounty_modal.js.jsx');
  var NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx');
  var NewsFeedItemPost = require('./news_feed_item_post.js.jsx');
  var NewsFeedItemModal = require('./news_feed_item_modal.js.jsx');
  var Tag = require('../tag.js.jsx');
  var Tile = require('../tile.js.jsx');
  var moment = require('moment');
  var ONE_DAY = 24 * 60 * 60 * 1000;

  var NewsFeedItem = React.createClass({
    displayName: 'NewsFeedItem',

    propTypes: {
      commentable: React.PropTypes.bool,
      enableModal: React.PropTypes.bool,
      productPage: React.PropTypes.bool,
      product: React.PropTypes.object.isRequired,
      target: React.PropTypes.object,
      user: React.PropTypes.object.isRequired
    },

    typeMap: {
      task: 'bounty',
      team_membership: 'team member',
      news_feed_item_post: 'update'
    },

    getDefaultProps: function() {
      return {
        enableModal: true,
        productPage: false
      };
    },

    getInitialState: function() {
      return {
        modalShown: false
      };
    },

    onModalHidden: function() {
      this.setState({
        modalShown: false
      });
    },

    render: function() {
      return (
        <Tile>
          {this.props.productPage ? null : this.renderSource()}
          {this.renderTarget()}
          {this.props.enableModal && this.state.modalShown ? this.renderModal() : null}
          {this.renderMeta()}
          {this.renderUserSource()}
          {this.renderLove()}
          {this.renderComments()}
        </Tile>
      );
    },

    renderComments: function() {
      var product = this.props.product;
      var target = this.props.target;

      if (this.props.productPage) {
        return <NewsFeedItemComments
            {...this.props}
            item={this.props}
            triggerModal={this.triggerModal} />;
      }

      this.renderLastComment();
    },

    renderLastComment: function() {
      var product = this.props.product;
      var target = this.props.target;
      var commentCount = target && target.comments_count;

      // Don't show any footer if there are no comments or tags
      // This isn't great, we should always have something for people to do
      if (!commentCount) {
        return;
      }

      if (!this.props.last_comment) {
        return;
      }

      // TODO This stuff should really be common across all the items
      var commentsUrl = this.props.target.url + "#comments";
      var lastComment = this.props.last_comment;

      return (
        <div className="px3 py2 h6 mt0 mb0 border-top">
          <a className="gray-3"
              href={commentsUrl}
              style={{ textDecoration: 'underline' }}>
            <span className="mr1">
              <Icon icon="comment" />
            </span>
            View {commentCount > 1 ? 'all' : ''} {commentCount} {commentCount > 1 ? 'comments' : 'comment'}
          </a>

          <div className="py2">
          <Comment
              author={lastComment.user}
              body={lastComment.markdown_body}
              timestamp={lastComment.created_at} />
          </div>
        </div>
      );
    },

    renderLove: function() {
      return <div className="px3 py2 border-top mb0">
        <Love heartable_id={this.props.heartable_id} heartable_type="NewsFeedItem" />
      </div>
    },

    renderMeta: function() {
      var target = this.props.target
      var tags = target && target.tags;

      if (tags) {
        var tagItems = null;
        var baseUrl = target.url;

        if (baseUrl && tags.length) {
          tagItems = _.map(tags, function(tag) {
            var url = baseUrl.split('/').slice(0, -1).join('/') + '?state=open&tag=' + tag.name;

            return (
              <li className="left px1" key={tag.id}>
                <a className="h6 mt0 mb0" href={url}><Tag tag={tag} /></a>
              </li>
            )
          })
        }

        return (
          <div className="px3 py1 h6 mt0 mb0">
            <ul className="list-reset clearfix mxn1 mb0">
              {tagItems}
            </ul>
          </div>
        );
      }
    },

    renderModal: function() {
      var target = this.props.target;

      if (target) {
        var onModalHidden = this.onModalHidden;
        var modal;

        switch (target.type) {
        case 'task':
          modal = NewsFeedItemBountyModal;
          break;
        default:
          modal = NewsFeedItemModal;
          break;
        }

        return React.createFactory(modal)({
          item: this.props,
          onHidden: onModalHidden
        });
      }
    },

    renderSource: function() {
      var product = this.props.product

      if (typeof product === "undefined" || product === null) {
        return null;
      }

      return (
        <a className="block px3 py2 clearfix border-bottom" href={product.url}>
          <div className="left mr1">
            <AppIcon app={product} size={36} />
          </div>
          <div className="overflow-hidden" style={{ lineHeight: '16px' }}>
            <div className="h6 mt0 mb0 black">{product.name}</div>
            <div className="h6 mt0 mb0 gray-dark">{product.pitch}</div>
          </div>
        </a>
      );
    },

    renderTarget: function() {
      var product = this.props.product;
      var target = this.props.target;
      var user = this.props.user;
      var triggerModal = this.triggerModal;

      if (target) {
        switch (target.type) {
        case 'task':
          return <NewsFeedItemBounty
              item={this.props}
              triggerModal={triggerModal} />;

        case 'team_membership':
          return <NewsFeedItemIntroduction
              {...this.props}
              triggerModal={triggerModal} />;

        case 'discussion':
          return <NewsFeedItemPost
              {...this.props}
              body={target.markdown_body || target.description_html}
              url={target.url}
              title={target.title}
              triggerModal={triggerModal} />;

        case 'post':
          return <NewsFeedItemPost
              {...this.props}
              body={target.markdown_body}
              url={target.url}
              title={target.title}
              triggerModal={triggerModal} />;

        default:
          return <NewsFeedItemPost
              {...this.props}
              title={target.name || target.title}
              body={target.description ||
                    target.markdown_body ||
                    target.description_html ||
                    target.body}
              url={target.url}
              triggerModal={triggerModal} />;
        }
      }
    },

    renderUserSource: function() {
      var user = this.props.user;
      var target = this.props.target;

      if (target && target.type === 'team_membership') {
        return null;
      }

      return (
        <div className="px3 py2 clearfix border-top h6 mb0">
          <div className="left mr2">
            <Avatar user={user} size={18} />
          </div>
          <div className="overflow-hidden gray-2">
            <span className="black bold">
              {user.username}
            </span>
              {' '} created this {this.targetNoun(target && target.type)}
          </div>
        </div>
      );
    },

    targetNoun: function(type) {
      var typeMap = this.typeMap;

      if (typeMap[type]) {
        return typeMap[type];
      }

      return type;
    },

    triggerModal: function() {
      this.setState({
        modalShown: true
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItem;
  }

  window.NewsFeedItem = NewsFeedItem;
})();
