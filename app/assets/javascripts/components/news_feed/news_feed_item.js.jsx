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
      news_feed_item_post: 'update'
    },

    render: function() {
      return (
        <div className="bg-white mb4 rounded overflow-hidden shadow">
          {this.renderTarget()}
          {this.renderComments()}
        </div>
      );
    },

    renderComments: function() {
      var product = this.props.product;
      var target = this.props.target;

      switch(target.type) {
      case 'team_membership':
        return (
          <div className="text-center h4 mt0 mb3 clearfix">
            <a href={product.url + '/chat'}>Say hi in chat!</a>
          </div>
        );
      default:
        return <NewsFeedItemComments item={this.props} />;
      }
    },

    renderTarget: function() {
      var product = this.props.product
      var target = this.props.target

      switch (target.type) {
      case 'task':
        return <NewsFeedItemBounty product={product} bounty={target} user={this.props.user} />;
      case 'team_membership':
        return <NewsFeedItemIntroduction product={product} introduction={target} user={this.props.user} />;
      default:
        return <NewsFeedItemPost product={product} post={target} user={this.props.user} />;
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItem;
  }

  window.NewsFeedItem = NewsFeedItem;
})();
