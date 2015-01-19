var AppIcon = require('../app_icon.js.jsx');
var ArchivedNewsFeedItemsStore = require('../../stores/archived_news_feed_items_store');
var Avatar = require('../ui/avatar.js.jsx');
var Bounty = require('../bounty.js.jsx')
var Comment = require('../comment.js.jsx');
var Discussion = require('../ui/discussion.js.jsx')
var Icon = require('../ui/icon.js.jsx');
var Introduction = require('../introduction.js.jsx')
var Lightbox = require('../lightbox.js.jsx')
var Markdown = require('../markdown.js.jsx');
var moment = require('moment');
var NewsFeedItemActionCreators = require('../../actions/news_feed_item_action_creators');
var NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx');
var NewsFeedItemBountyModal = require('./news_feed_item_bounty_modal.js.jsx');
var NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx');
var NewsFeedItemModal = require('./news_feed_item_modal.js.jsx');
var NewsFeedItemPost = require('./news_feed_item_post.js.jsx');
var SubscriptionsStore = require('../../stores/subscriptions_store');
var Tag = require('../tag.js.jsx');
var Tile = require('../tile.js.jsx');
var Update = require('../update.js.jsx')
var UserStore = require('../../stores/user_store');

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
    var id = this.props.id;

    return {
      isArchived: ArchivedNewsFeedItemsStore.isArchived(id),
      isSubscribed: SubscriptionsStore.isSubscribed(id),
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

  renderEditButton: function() {
    if (UserStore.isCoreTeam() || this.props.user.id === UserStore.getId()) {
      var target = this.props.target;

      // only turn on for posts
      if (target && target.type === 'post') {
        return (
          <li>
            <a href={target.url + '/edit'}>Edit</a>
          </li>
        );
      }
    }
  },

  renderFooter: function() {
    if (this.props.showAllComments) {
      return (
        <div className="card-footer px3 py2 clearfix">
          <ul className="list-inline mt0 mb0 py1 right">
            {this.renderArchiveButton()}
            {this.renderSubscribeButton()}
            {this.renderEditButton()}
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
            <div className="inline-block" key={tag.id}>
              <Tag tag={tag} />
            </div>
          )
        })
      }
      return (
        <div className="px3 pb3">
          {tagItems}
        </div>
      );
    }
  },

  renderModal: function() {
    var item = this.props
    var product = this.props.product
    var target = this.props.target

    var modalTarget;

    target.product = product

    switch (target.type) {
    case 'task':
      modalTarget = <Bounty
        key={target.id}
        bounty={target}
        noInvites={true}
        item={item}
        showCoins={product.slug !== 'meta'}
        editCoins={false} />
      break
    case 'post':
      modalTarget = <Update update={target}
                            item={item}
                            newsFeedItem={item}
                            productSlug={product.slug} />
      break
    case 'team_membership':
      modalTarget = <Introduction {...item} />
      break
    default:
      modalTarget = <NewsFeedItem {...item}
                                  commentable={false}
                                  enableModal={false}
                                  productPage={true}
                                  showAllComments={false} />
      break
    }

    return <Lightbox onHidden={this.onModalHidden} showControlledOuside={true} size="modal-lg">
      <Discussion target={modalTarget} newsFeedItem={item} />
    </Lightbox>
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
          <div className="h6 mt0 mb0 gray-2">{product.pitch}</div>
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
      <div className="px3 py2 border-top mb0 mt0">
        <div style={{marginBottom: "-3px"}}>
          <div className="inline-block valign-top">
            <div className="left mr1">
              <Avatar user={user} size={18} />
            </div>
          </div>
          <div className="inline-block valign-top gray-2 fs3">
            <span className="black bold">{user.username}</span>
            {' '} created this {this.targetNoun(target && target.type)}
          </div>
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
