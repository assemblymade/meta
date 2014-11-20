/** @jsx React.DOM */

// TODO This is in application.js (chrislloyd)
// var _ = require('underscore')

var Avatar = require('../avatar.js.jsx')
var NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx')
var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx')
var NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx')
var NewsFeedItemPost = require('./news_feed_item_post.js.jsx')
var NewsFeedItemStore = require('../../stores/news_feed_item_store')

var Tile = require('../tile.js.jsx')
var moment = require('moment');
var ONE_DAY = 24 * 60 * 60 * 1000;

module.exports = React.createClass({
  displayName: 'NewsFeedTile',

  propTypes: {
    product: React.PropTypes.object.isRequired,
    target: React.PropTypes.object,
    user: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    NewsFeedItemStore.addChangeListener(this.getCommentsCount);
  },

  getCommentsCount: function() {
    var comments = NewsFeedItemStore.getComments(this.props.id);
    var count = comments.confirmed.length;

    this.setState({
      commentsCount: this.state.commentsCount + count
    });
  },

  getInitialState: function() {
    return {
      commentsCount: this.props.comments_count
    };
  },

  render: function() {
    return (
      <Tile>
        {this.renderTarget()}
        {this.renderSource()}
        {this.renderComments()}
      </Tile>
    );
  },

  renderComments: function() {
    var product = this.props.product
    var target = this.props.target

    var commentsCount = this.state.commentsCount;
    var tags = this.props.target.tags

    // TODO This stuff should really be common across all the items
    var loveItem = <li className="left px1">
      <Love heartable_id={this.props.heartable_id} heartable_type="NewsFeedItem" />
    </li>

    var commentItem;
    if (commentsCount) {
      var commentsUrl = target.url + "#comments"

      commentItem = (
        <li className="left px1">
          <a className="gray" href={commentsUrl}>
            <span className="fa fa-comment mr1"></span>
            {commentsCount}
          </a>
        </li>
      )
    }

    var tagItems = null
    if (typeof tags !== "undefined" && tags !== null) {
      tagItems = _.map(tags, function(tag) {
        var baseUrl = target.url || this.props.url;
        var url = baseUrl && baseUrl.split('/').slice(0, -1).join('/') + '?state=open&tag=' + tag.name;

        return (
          <li className="left px1" key={tag.id}>
            <a className="gray bold" href={url}>
              <span className="h6 mt0 mb0 gray">{tag.name.toUpperCase()}</span>
            </a>
          </li>
        )
      }.bind(this));
    }

    var itemList = null
    if(tagItems && tagItems.length || commentItem) {
      itemList = (
        <ul className="list-reset clearfix mxn1">
          {loveItem}
          {commentItem}
          {tagItems}
        </ul>
      )
    }

    return (
      <div>
        <div className="px3">
          {itemList}
        </div>
        <div className="border-top" style={{ backgroundColor: 'rgba(0,0,0,0.01)'}}>
          <NewsFeedItemComments item={this.props} />
        </div>
      </div>
    );
  },

  renderTarget: function() {
    var product = this.props.product;
    var target = this.props.target;
    var user = this.props.user;

    switch (target.type) {
    case 'task':
      return <NewsFeedItemBounty item={this.props} />;

    case 'team_membership':
      return <NewsFeedItemIntroduction
          user={target.user}
          intro={target.bio}
          product={product} />;

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
          body={target.description ||
            target.markdown_body ||
            target.description_html}
          url={target.url} />;
    }
  },

  renderSource: function() {
    var user = this.props.user

    return (
      <a className="block px3 py2 clearfix border-top" href={user.url}>
        <div className="left mr2">
          <Avatar user={user} size={24} />
        </div>
        <div className="overflow-hidden">
          <div className="black">{user.username}</div>
        </div>
      </a>
    );
  },
});

window.NewsFeedItem = module.exports;
