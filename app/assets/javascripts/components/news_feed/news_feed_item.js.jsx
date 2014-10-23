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
      var target = this.props.target;

      return (
        <div className="mb2 clearfix h6">
          <div className="mr2 left">
            <Avatar user={this.props.user} size={48} />
          </div>
          <div className="overflow-hidden py2">
            <a href={user.url}>{user.username}</a>
            {this.targetVerb(target.type)}
            <a href={target.url}>{this.targetNoun(target.type)}</a>
            {' '} at {moment(new Date(this.props.created)).format('h:mm a')}
          </div>
        </div>
      );
    },

    productAndTitle: function() {
      var product = this.props.product;
      var target = this.props.target;

      if (target.type === 'team_membership') {
        var user = this.props.user;

        return (
          <div className="card-heading clearfix text-center">
            <div className="col col-1">
              <a href={product.url} title={product.name}>
                <img className="app-icon" src={product.logo_url} style={{ width: '48px' }} />
              </a>
            </div>
            <div className="col col-11">
              <span style={{ 'font-weight': 'bold', 'font-size': '24px' }}>{target.bio}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="p3 clearfix" style={{ 'border-bottom': '1px solid #f5f5f5' }}>
          <a className="block left mr3" href={product.url} title={product.name}>
            <AppIcon app={product} size={48} />
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

    targetType: function() {
      var target = this.props.target;

      return (
        <span>
          {this.targetVerb(target.type)} {this.targetNoun(target.type)}
        </span>
      );
    },

    targetNoun: function(type) {
      var typeMap = this.typeMap.nouns;

      if (typeMap[type]) {
        return typeMap[type].call(this);
      }

      return <a href={this.props.target.url}>{type}</a>;
    },

    targetVerb: function(type) {
      var typeMap = this.typeMap.verbs;

      if (typeMap[type]) {
        return typeMap[type].call(this);
      }

      return ' posted a new ';
    },

    timestamp: function() {
      return (
        <span className="text-muted mr5">
          &nbsp;at {moment(new Date(this.props.created)).format('h:mm a')}
        </span>
      );
    },

    typeMap: {
      verbs: {
        task: function() {
          return (
            <span>
              &nbsp;posted a new <a href={this.props.target.url}>bounty</a>
            </span>
          );
        },

        team_membership: function() {
          return ' joined the ';
        }
      },
      nouns: {
        post: function() {
          return 'update';
        },

        task: function() {
          var product = this.props.product;

          return  (
            <span>
              in <a href={product.url}>{product.name}</a>
            </span>
          );
        },

        team_membership: function() {
          var product = this.props.product;

          return <a href={product.url + '/people'}>{product.name} team</a>;
        }
      }
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
