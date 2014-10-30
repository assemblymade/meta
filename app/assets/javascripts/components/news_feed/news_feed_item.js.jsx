/** @jsx React.DOM */

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
      news_feed_item_post: 'update',
      news_feed_item_git_commit: 'commit'
    },

    render: function() {
      return (
        <div>
          {this.renderHeader()}
          <div className="bg-white mb4 rounded overflow-hidden shadow">
            {this.renderTarget()}
            <NewsFeedItemComments item={this.props} />
          </div>
        </div>
      );
    },

    renderHeader: function() {
      var user = this.props.user;
      var product = this.props.product;
      var target = this.props.target;

      return (
        <div className="clearfix h6 mt0 mb2">
          <div className="left">
            <AppIcon app={this.props.product} size={42} />
          </div>
          <div className="overflow-hidden p2">
            New <a href={target.url}>{this.targetNoun(target.type)}</a>
            {' '} in <a href={product.url}>{product.name}</a>
          </div>
        </div>
      );
    },


    renderTarget: function() {
      var target = this.props.target

      switch (target.type) {
      case 'task':
        return <NewsFeedItemBounty bounty={target} user={this.props.user} />;
      case 'team_membership':
        return <NewsFeedItemIntroduction introduction={target} user={this.props.user} />;
      case 'work':
        return <NewsFeedItemWork work={target} user={this.props.user} />;
      default:
        return <NewsFeedItemPost product={this.props.product} post={target} user={this.props.user} />;
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
