/** @jsx React.DOM */

(function() {
  var Avatar = require('../avatar.js.jsx');
  var NewsFeedBountyItemBody = require('./bounty_item/body.js.jsx');
  var NewsFeedBountyItemTitle = require('./bounty_item/title.js.jsx');
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
      return (
        <div className="mb1">
          {this.avatar()}
          {this.username()}
          {this.targetType()}
          {this.timestamp()}
        </div>
      );
    },

    productAndTitle: function() {
      var product = this.props.product;
      var target = this.props.target;

      return (
        <div className="card-heading clearfix">
          <div className="col col-1">
            <a href={product.url} title={product.name}>
              <img className="app-icon" src={product.logo_url} style={{ width: '48px' }} />
            </a>
          </div>
          {this.targetTitle()}
        </div>
      );
    },

    render: function() {
      return (
        <div className="mb4">
          {this.header()}
          <div className="card" style={{ 'margin-bottom': '0px', 'border-radius': '0px' }}>
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
      default:
        return null;
      }
    },

    targetTitle: function() {
      var target = this.props.target;

      switch (target.type) {
      case 'task':
        return <NewsFeedBountyItemTitle bounty={target} />;
      default:
        return (
          <div className="ml1 col col-10" style={{ 'font-size': '24px', 'line-height': '1em' }}>
            <span>
              &nbsp;<a href={target.url} style={{color: '#333'}}>
                {target.title}
              </a>
            </span>
          </div>
        );
      }
    },

    targetType: function() {
      var target = this.props.target;

      return (
        <span>
          &nbsp;posted a new <a href={target.url}>{this.transformType(target.type)}</a>
        </span>
      );
    },

    timestamp: function() {
      return (
        <span className="text-muted mr5">
          &nbsp;at {moment(new Date(this.props.created)).format('h:mm a')}
        </span>
      );
    },

    transformType: function(type) {
      var typeMap = {
        task: 'bounty'
      };

      if (typeMap[type]) {
        return typeMap[type];
      }

      return type;
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
