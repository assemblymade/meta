/** @jsx React.DOM */

// TODO This is in application.js (chrislloyd)
// var _ = require('underscore')

(function() {
  var Avatar = require('../avatar.js.jsx');
  var NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx');
  var NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx');
  var NewsFeedItemPost = require('./news_feed_item_post.js.jsx');
  var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx');
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
        <div className="bg-white rounded shadow">
          {this.renderSource()}
          {this.renderTarget()}
          {this.renderComments()}
        </div>
      );
    },

    renderTarget: function() {
      var product = this.props.product
      var target = this.props.target

      switch (target.type) {
      case 'task':
        return <NewsFeedItemBounty product={product} bounty={target} user={this.props.user} title={target.title} coins={target.value} />;

      case 'team_membership':
        return <NewsFeedItemIntroduction user={target.user} intro={target.bio} />;

      case 'discussion':
        return <NewsFeedItemPost body={target.description_html} url={target.url} title={target.title} />;

      case 'post':
        return <NewsFeedItemPost body={target.markdown_body} url={target.url} title={target.title} />;

      default:
        return <NewsFeedItemPost title={target.name || target.title} body={this.props.description_html} url={target.url} />;
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
            <div className="left mr2">
              <AppIcon app={product} size={24} />
            </div>
            <div className="overflow-hidden">
              <div className="black">{product.name}</div>
            </div>
          </a>
        </div>
      );
    },

    renderComments: function() {
      var product = this.props.product
      var target = this.props.target

      var commentCount = this.props.target.comments_count
      var tags = this.props.target.tags

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
      if (typeof tags !== "undefined" && tags !== null) {
        tagItems = _.map(tags, function(tag) {
          return (
            <li className="left px1" key={tag.id}>
              <span className="h6 mt0 mb0 gray">#{tag.name}</span>
            </li>
          )
        })
      }

      return (
        <div className="px3 py2 h6 mt0 mb0">
          <ul className="list-reset clearfix mxn1">
            {commentItem}
            {tagItems}
          </ul>
        </div>
      )
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
