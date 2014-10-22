/** @jsx React.DOM */

(function() {
  var Avatar = require('../avatar.js.jsx');
  var NewsFeedItemComments = require('./news_feed_item_comments.js.jsx');

  var NewsFeedItem = React.createClass({
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

    product: function() {
      var product = this.props.product;
      var target = this.props.target;

      return (
        <div className="card-heading clearfix">
          <div className="col col-1">
            <a href={this.props.product.url} title={this.props.product.name}>
              <img className="app-icon" src={this.props.logo_url} style={{ width: '48px' }} />
            </a>
          </div>
          <div className="ml1 col col-10" style={{ 'font-size': '24px', 'line-height': '1em' }}>
            <span className="text-coins text-weight-bold">
              <span className="icon icon-app-coin"></span>
              <span>{numeral(target.value).format('0,0')}</span>
            </span>
            <span>
              &nbsp;{target.title} <a href={target.url} style={{'color': '#d3d3d3'}}>#{target.number}</a>
            </span>
          </div>
        </div>
      );
    },

    render: function() {
      return (
        <div className="mb4">
          {this.header()}
          <div className="card" style={{ 'margin-bottom': '0px', 'border-radius': '0px' }}>
            {this.product()}
            <NewsFeedItemComments item={this.props} />
          </div>
        </div>
      );
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
