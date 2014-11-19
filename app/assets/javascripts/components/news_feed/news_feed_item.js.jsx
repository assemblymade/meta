/** @jsx React.DOM */

// TODO This is in application.js (chrislloyd)
// var _ = require('underscore')

(function() {
  var AppIcon = require('../app_icon.js.jsx');
  var Avatar = require('../avatar.js.jsx');
  var Markdown = require('../markdown.js.jsx');
  var NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx');
  var NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx');
  var NewsFeedItemPost = require('./news_feed_item_post.js.jsx');
  var Tile = require('../tile.js.jsx')
  var moment = require('moment');
  var ONE_DAY = 24 * 60 * 60 * 1000;

  var NewsFeedItem = React.createClass({
    propTypes: {
      product: React.PropTypes.object.isRequired,
      target: React.PropTypes.object,
      user: React.PropTypes.object.isRequired
    },

    typeMap: {
      task: 'bounty',
      team_membership: 'team member',
      news_feed_item_post: 'update'
    },

    render: function() {
      return (
        <Tile>
          {this.renderSource()}
          {this.renderTarget()}
          {this.renderTags()}
          {this.renderUserSource()}
          <div className="py2 border-top">
            {this.renderLastComment()}
            {this.renderComments()}
          </div>
        </Tile>
      );
    },

    renderComments: function() {
      var product = this.props.product;
      var target = this.props.target;

      var commentCount = target && target.comments_count;


      // Don't show any footer if there's no comments or tags
      // This isn't great, we should always have something for people to do
      if (!commentCount) {
        return;
      }

      // TODO This stuff should really be common across all the items
      var commentItem = null;
      var commentsUrl = this.props.target.url + "#comments";

      commentItem = (
        <li className="left px1">
          <a className="gray-3" href={commentsUrl} style={{ textDecoration: 'underline' }}>
            <span className="fa fa-comment mr1"></span>
            View {commentCount > 1 ? 'all' : ''} {commentCount} {commentCount > 1 ? 'comments' : 'comment'}
          </a>
        </li>
      )

      return (
        <div className="px3 h6">
          <ul className="list-reset clearfix mxn1">
            {commentItem}
          </ul>
        </div>
      );
    },

    renderLastComment: function() {
      var comment = this.props.last_comment;

      if (comment) {
        var user = comment.user;

        return (
          <div className="clearfix px3" key={comment.id}>
            <div className="left mr2">
              <Avatar user={user} size={24} />
            </div>
            <div className="overflow-hidden gray-2">
              <a className="bold black" style={{ lineHeight: '18px' }} href={user.url}>{user.username}</a>
              {' '} commented <time>{$.timeago(comment.created_at)}</time>
              <div className='gray-darker'>
                <Markdown content={comment.markdown_body || window.marked(comment.body)} normalize={true} />
              </div>
            </div>
          </div>
        );
      }
    },

    renderSource: function() {
      var product = this.props.product
      var user = this.props.user

      if (typeof product === "undefined" || product === null) {
        return null;
      }

      return (
        <div>
          <a className="block px3 py2 clearfix border-bottom" href={product.url}>
            <div className="left mr1">
              <AppIcon app={product} size={32} />
            </div>
            <div className="overflow-hidden" style={{ lineHeight: '16px' }}>
              <div className="black">{product.name}</div>
              <div className="gray-dark text-small">{product.pitch}</div>
            </div>
          </a>
        </div>
      );
    },

    renderTags: function() {
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
                <span className="h6 mt0 mb0">
                  <a className="gray-2 bold" href={url}>
                    {tag.name.toUpperCase()}
                  </a>
                </span>
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

    renderTarget: function() {
      var product = this.props.product;
      var target = this.props.target;
      var user = this.props.user;

      if (target) {
        switch (target.type) {
        case 'task':
          return <NewsFeedItemBounty
            product={product}
            bounty={target}
            user={this.props.user}
            title={target.title}
            coins={target.value}
            item={this.props} />;

        case 'team_membership':
          return <NewsFeedItemIntroduction
            user={user}
            intro={target.bio} />;

        case 'discussion':
          return <NewsFeedItemPost
            body={target.markdown_body || target.description_html}
            url={target.url}
            title={target.title} />;

        case 'post':
          return <NewsFeedItemPost
            body={target.markdown_body}
            url={target.url}
            title={target.title} />;

        default:
          return <NewsFeedItemPost
            title={target.name || target.title}
            body={target.description || target.body}
            url={target.url} />;
        }
      }
    },

    renderUserSource: function() {
      var user = this.props.user

      return (
        <div className="px3 py2 clearfix border-top h6 mb0">
          <div className="left mr2">
            <Avatar user={user} size={18} />
          </div>
          <div className="overflow-hidden gray-2">
            <span className="black bold">
              {user.username}
            </span>
            {' '} created this {this.targetNoun(this.props.target.type)} <time>{$.timeago(new Date(this.props.created))}</time>
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
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItem;
  }

  window.NewsFeedItem = NewsFeedItem;
})();
