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
  var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx');
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
          {this.renderComments()}
          {this.renderLastComment()}
        </Tile>
      );
    },

    renderComments: function() {
      var product = this.props.product
      var target = this.props.target

      var commentCount = target && target.comments_count
      var tags = target && target.tags

      // Don't show any footer if there's no comments or tags
      // This isn't great, we should always have something for people to do
      if ((typeof commentCount === "undefined" || commentCount === null || commentCount < 1) && (typeof tags === "undefined" || tags === null)) {
        return
      }

      // TODO This stuff should really be common across all the items
      var commentItem = null

      if ((typeof commentCount !== "undefined" && commentCount !== null) &&  commentCount > 0) {

        var commentsUrl = this.props.target.url + "#comments"

        commentItem = (
          <li className="left px1">
            <a className="gray" href={commentsUrl}>
              <span className="fa fa-comment mr1"></span>
              {commentCount}
            </a>
          </li>
        )
      }

      var tagItems = null
      var baseUrl = this.props.target.url;
      if (typeof tags !== "undefined" && tags !== null) {
        tagItems = _.map(tags, function(tag) {
          var url = baseUrl.split('/').slice(0, -1).join('/') + '?state=open&tag=' + tag.name;
          return (
            <li className="left px1" key={tag.id}>
              <span className="h6 mt0 mb0">
                <a className="gray bold" href={url}>
                  {tag.name.toUpperCase()}
                </a>
              </span>
            </li>
          )
        })
      }

      return (
        <div className="px3 py2 h6 mt0 mb0">
          <ul className="list-reset clearfix mxn1">
            {tagItems}
          </ul>
          <ul className="list-reset clearfix mxn1">
            {commentItem}
          </ul>
        </div>
      );
    },

    renderLastComment: function() {
      var comments = this.props.news_feed_item_comments;

      if (comments && comments.length) {
        var comment = comments[comments.length - 1];
        var user = comment.user;

        return (
          <div className="border-top">
            <div className="block px3 py1 gray">
              <a className="gray" href={this.props.target.url + '#comments'}>
                Last comment
              </a>
            </div>
            <div className="clearfix px3" key={comment.id} style={{ paddingBottom: '12px' }}>
              <div className="left mr2">
                <Avatar user={user} size={24} />
              </div>
              <div className="overflow-hidden">
                <a className="block bold black" style={{ lineHeight: '18px' }} href={user.url}>{user.username}</a>
                <div className='gray-darker'>
                  <Markdown content={comment.markdown_body || window.marked(comment.body)} normalize={true} />
                </div>
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

    renderTarget: function() {
      var product = this.props.product
      var target = this.props.target

      if (target) {
        switch (target.type) {
        case 'task':
          return <NewsFeedItemBounty
            product={product}
            bounty={target}
            user={this.props.user}
            title={target.title}
            coins={target.value}
            comments={this.props.news_feed_item_comments}
            item={this.props} />;

        case 'team_membership':
          return <NewsFeedItemIntroduction
            user={target.user}
            intro={target.bio} />;

        case 'discussion':
          return <NewsFeedItemPost
            body={target.description_html}
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
            body={target.description}
            url={target.url} />;
        }
      }
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
