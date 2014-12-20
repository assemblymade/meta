var AppIcon = require('../app_icon.js.jsx');
var ArchivedNewsFeedItemsStore = require('../../stores/archived_news_feed_items_store');
var Avatar = require('../avatar.js.jsx');
var Comment = require('../comment.js.jsx');
var Icon = require('../icon.js.jsx');
var Markdown = require('../markdown.js.jsx');
var NewsFeedItemActionCreators = require('../../actions/news_feed_item_action_creators');
var NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx');
var NewsFeedItemBountyModal = require('./news_feed_item_bounty_modal.js.jsx');
var NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx');
var NewsFeedItemModal = require('./news_feed_item_modal.js.jsx');
var NewsFeedItemPost = require('./news_feed_item_post.js.jsx');
var SubscriptionsStore = require('../../stores/subscriptions_store');
var Tag = require('../tag.js.jsx');
var Tile = require('../tile.js.jsx');
var UserStore = require('../../stores/user_store');
var moment = require('moment');
var ONE_DAY = 24 * 60 * 60 * 1000;

var NewsFeedItem = React.createClass({
  displayName: 'NewsFeedItem',

  propTypes: {
    commentable: React.PropTypes.bool,
    enableModal: React.PropTypes.bool,
    productPage: React.PropTypes.bool,
    product: React.PropTypes.object.isRequired,
    showAllComments: React.PropTypes.bool,
    target: React.PropTypes.object,
    user: React.PropTypes.object.isRequired
  },

  typeMap: {
    task: 'bounty',
    team_membership: 'team member',
    news_feed_item_post: 'update'
  },

  componentDidMount: function() {
    ArchivedNewsFeedItemsStore.addChangeListener(this.getStateFromStore);
    SubscriptionsStore.addChangeListener(this.getStateFromStore);
  },

  componentWillUnmount: function() {
    ArchivedNewsFeedItemsStore.removeChangeListener(this.getStateFromStore);
    SubscriptionsStore.removeChangeListener(this.getStateFromStore);
  },

  getDefaultProps: function() {
    return {
      enableModal: true,
      productPage: false
    };
  },

  getInitialState: function() {
    return {
      isArchived: this.props.archived_at != null,
      isSubscribed: SubscriptionsStore.isSubscribed(this.props.id),
      modalShown: false
    };
  },

  getStateFromStore: function() {
    var target = this.props.target;

    if (target && target.type === 'post') {
      this.setState({
        isArchived: ArchivedNewsFeedItemsStore.isArchived(this.props.id),
        isSubscribed: SubscriptionsStore.isSubscribed(this.props.id)
      });
    }
  },

  // TODO: (pletcher) Move this method to a Post component;
  // it's time to split these out
  handleArchive: function() {
    var productSlug = this.props.product.slug;
    var itemId = this.props.id;

    if (this.state.isArchived) {
      NewsFeedItemActionCreators.unarchive(productSlug, itemId);
    } else {
      NewsFeedItemActionCreators.archive(productSlug, itemId);
    }
  },

  handleSubscribe: function() {
    var productSlug = this.props.product.slug;
    var itemId = this.props.id;

    if (this.state.isSubscribed) {
      NewsFeedItemActionCreators.unsubscribe(productSlug, itemId);
    } else {
      NewsFeedItemActionCreators.subscribe(productSlug, itemId);
    }
  },

  onModalHidden: function() {
    this.setState({
      modalShown: false
    });
  },

  render: function() {
    return (
      <Tile>
        {this.props.productPage ? null : this.renderSource()}
        {this.renderTarget()}
        {this.props.enableModal && this.state.modalShown ? this.renderModal() : null}
        {this.renderMeta()}
        {this.renderUserSource()}
        {this.renderLove()}
        {this.renderFooter()}
        {this.renderComments()}
      </Tile>
    );
  },

  renderArchiveButton: function() {
    if (!UserStore.isCoreTeam()) {
      return;
    }

    // only turn on for posts
    if (this.props.target && this.props.target.type === 'post') {
      var text = 'Archive';
      if (this.state.isArchived) {
        text = 'Unarchive';
      }

      return (
        <li>
          <a href="javascript:void(0);" onClick={this.handleArchive}>{text}</a>
        </li>
      );
    }
  },

  renderComments: function() {
    var product = this.props.product;
    var target = this.props.target;

    return <NewsFeedItemComments
        {...this.props}
        item={this.props}
        triggerModal={this.triggerModal} />;
  },

  renderFooter: function() {
    if (this.props.showAllComments) {
      return (
        <div className="card-footer px3 py2 clearfix">
          <ul className="list-inline mt0 mb0 py1 right">
            {this.renderArchiveButton()}
            {this.renderSubscribeButton()}
          </ul>
        </div>
      );
    }
  },

  renderLove: function() {
    return <div className="px3 py2 border-top border-bottom">
      <Love heartable_id={this.props.heartable_id} heartable_type="NewsFeedItem" />
    </div>
  },

  renderMeta: function() {
    var target = this.props.target
    var tags = target && (target.tags || target.marks);

    if (tags) {
      var tagItems = null;
      var baseUrl = target.url;

      if (baseUrl && tags.length) {
        tagItems = _.map(tags, function(tag) {
          var url = baseUrl.split('/').slice(0, -1).join('/') + '?state=open&tag=' + tag.name;

          return (
            <li className="left px1" key={tag.id}>
              <a className="h6 mt0 mb0" href={url}><Tag tag={tag} /></a>
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

  renderModal: function() {
    var target = this.props.target;

    if (target) {
      var onModalHidden = this.onModalHidden;
      var modal;

      switch (target.type) {
      case 'task':
        modal = NewsFeedItemBountyModal;
        break;
      default:
        modal = NewsFeedItemModal;
        break;
      }

      return React.createFactory(modal)({
        item: this.props,
        onHidden: onModalHidden
      });
    }
  },

  renderSource: function() {
    var product = this.props.product

    if (typeof product === "undefined" || product === null) {
      return null;
    }

    return (
      <a className="block px3 py2 clearfix border-bottom" href={product.url}>
        <div className="left mr1">
          <AppIcon app={product} size={36} />
        </div>
        <div className="overflow-hidden" style={{ lineHeight: '16px' }}>
          <div className="h6 mt0 mb0 black">{product.name}</div>
          <div className="h6 mt0 mb0 gray-dark">{product.pitch}</div>
        </div>
      </a>
    );
  },

  renderSubscribeButton: function() {
    var user = UserStore.getUser();

    if (!user) {
      return (
        <li>
          <a href="/signup">Sign up</a>
        </li>
      );
    }

    // only turn on for posts
    if (this.props.target && this.props.target.type === 'post') {
      var text = 'Subscribe';
      if (this.state.isSubscribed) {
        text = 'Unsubscribe';
      }

      return (
        <li>
          <a href="javascript:void(0);" onClick={this.handleSubscribe}>{text}</a>
        </li>
      );
    }
  },

  renderTarget: function() {
    var product = this.props.product;
    var target = this.props.target;
    var user = this.props.user;
    var triggerModal = this.triggerModal;

    if (target) {
      switch (target.type) {
      case 'task':
        return <NewsFeedItemBounty
            {...this.props}
            item={this.props}
            triggerModal={triggerModal} />;

      case 'team_membership':
        return <NewsFeedItemIntroduction
            {...this.props}
            triggerModal={triggerModal} />;

      case 'discussion':
        return <NewsFeedItemPost
            {...this.props}
            body={target.markdown_body || target.description_html}
            url={target.url}
            title={target.title}
            triggerModal={triggerModal} />;

      case 'post':
        return <NewsFeedItemPost
            {...this.props}
            body={this.props.enableModal ? target.short_body : target.markdown_body}
            url={target.url}
            title={target.title}
            triggerModal={triggerModal} />;

      default:
        return <NewsFeedItemPost
            {...this.props}
            title={target.name || target.title}
            body={target.description ||
                  target.markdown_body ||
                  target.description_html ||
                  target.body}
            url={target.url}
            triggerModal={triggerModal} />;
      }
    }
  },

  renderUserSource: function() {
    var user = this.props.user;
    var target = this.props.target;

    if (target && target.type === 'team_membership') {
      return null;
    }

    return (
      <div className="px3 py2 clearfix border-top h6 mb0">
        <div className="left mr2">
          <Avatar user={user} size={18} />
        </div>
        <div className="overflow-hidden gray-2">
          <span className="black bold">
            {user.username}
          </span>
            {' '} created this {this.targetNoun(target && target.type)}
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
  },

  triggerModal: function() {
    this.setState({
      modalShown: true
    });
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItem;
}

window.NewsFeedItem = NewsFeedItem;
