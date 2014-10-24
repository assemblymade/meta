/** @jsx React.DOM */

(function() {
  var Avatar = require('../avatar.js.jsx');
  var NewsFeedBountyItemBody = require('./bounty_item/body.js.jsx');
  var NewsFeedBountyItemTitle = require('./bounty_item/title.js.jsx');
  var NewsFeedPostItemBody = require('./post_item/body.js.jsx');
  var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx');

  var NewsFeedItem = React.createClass({
    propTypes: {
      product: React.PropTypes.object.isRequired,
      target: React.PropTypes.object,
      user: React.PropTypes.object.isRequired
    },

    avatar: function() {
      return (
        <span className="mr2">
          <Avatar user={this.props.user} size={48} />
        </span>
      );
    },

    header: function() {
      var user = this.props.user;
      var product = this.props.product;
      var target = this.props.target;

      return (
        <div className="mb2 clearfix h6">
          <div className="mr1 left">
            <AppIcon app={this.props.product} size={24} />
          </div>
          <div className="overflow-hidden">
            {' '} New <a href={target.url}>{this.targetNoun(target.type)}</a>
            {' '} in <a href={product.url}>{product.name}</a>
            {' '} at {moment(new Date(this.props.created)).format('h:mm a')}
          </div>
        </div>
      );
    },

    productAndTitle: function() {
      var product = this.props.product;
      var target = this.props.target;
      var user = this.props.user;

      if (target.type === 'team_membership') {
        return (
          <div className="p3 clearfix" style={{ 'border-bottom': '1px solid #f5f5f5' }}>
            <a className="block left mr3" href={product.url} title={'@' + user.username}>
              <Avatar user={user} size={48} />
            </a>

            <div className="overflow-hidden h4 mt0 mb0">
              {target.bio}
            </div>
          </div>
        );
      }

      return (
        <div className="p3 clearfix" style={{ 'border-bottom': '1px solid #f5f5f5' }}>
          <a className="block left mr3" href={product.url} title={'@' + user.username}>
            <Avatar user={user} size={48} />
          </a>

          <span className="overflow-hidden">
            {this.targetTitle()}
          </span>
        </div>
      );
    },

    render: function() {
      return (
        <div>
          {this.header()}
          <div className="bg-white mb4 rounded overflow-hidden">
            {this.productAndTitle()}
            {this.targetBody()}
            <NewsFeedItemComments item={this.props} />
          </div>
        </div>
      );
    },

    targetBody: function() {
      var target = this.props.target;

      switch (target.type) {
      case 'task':
        return <NewsFeedBountyItemBody bounty={target} />;
      case 'post':
        return <NewsFeedPostItemBody post={target} />;
      default:
        return null;
      }
    },

    targetNoun: function(type) {
      var typeMap = this.typeMap;

      if (typeMap[type]) {
        return typeMap[type];
      }

      return type;
    },

    targetTitle: function() {
      var target = this.props.target;

      switch (target.type) {
      case 'task':
        return <NewsFeedBountyItemTitle bounty={target} />;
      default:
        return (
          <div className="h4">
            <span>
              <a href={target.url} style={{color: '#333'}}>
                {target.title}
              </a>
            </span>
          </div>
        );
      }
    },

    timestamp: function() {
      return (
        <span className="text-muted mr5">
          &nbsp;at {moment(new Date(this.props.created)).format('h:mm a')}
        </span>
      );
    },

    typeMap: {
      task: 'bounty',
      team_membership: 'introduction'
    },

    username: function() {
      var user = this.props.user;

      return (
        <strong>
          <a href={user.url}>{user.username}</a>
        </strong>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItem;
  }

  window.NewsFeedItem = NewsFeedItem;
})();
