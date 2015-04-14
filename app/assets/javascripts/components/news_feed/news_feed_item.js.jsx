'use strict';

const ActivityFeedComment = require('../activity_feed_comment.js.jsx');
const AppIcon = require('../app_icon.js.jsx');
const ArchivedNewsFeedItemsStore = require('../../stores/archived_news_feed_items_store');
const Avatar = require('../ui/avatar.js.jsx');
const Bounty = require('../bounty.js.jsx')
const Comment = require('../comment.js.jsx');
const Discussion = require('../ui/discussion.js.jsx')
const Heart = require('../heart.js.jsx');
const Introduction = require('../introduction.js.jsx')
const Lightbox = require('../lightbox.js.jsx')
const Markdown = require('../markdown.js.jsx');
const moment = require('moment');
const NewsFeedItemActionCreators = require('../../actions/news_feed_item_action_creators');
const NewsFeedItemBounty = require('./news_feed_item_bounty.js.jsx');
const NewsFeedItemIntroduction = require('./news_feed_item_introduction.js.jsx');
const NewsFeedItemModal = require('./news_feed_item_modal.js.jsx');
const NewsFeedItemPost = require('./news_feed_item_post.js.jsx');
const ProductStore = require('../../stores/product_store');
const SubscriptionsStore = require('../../stores/subscriptions_store');
const SvgIcon = require('../ui/svg_icon.js.jsx')
const Tag = require('../tag.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const Update = require('../update.js.jsx')
const UserStore = require('../../stores/user_store');

const ONE_DAY = 24 * 60 * 60 * 1000;

let NewsFeedItem = React.createClass({
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
    let id = this.props.id;

    return {
      isArchived: ArchivedNewsFeedItemsStore.isArchived(id),
      isSubscribed: SubscriptionsStore.isSubscribed(id),
      modalShown: false
    };
  },

  getStateFromStore: function() {
    let target = this.props.target;

    if (target && target.type === 'post') {
      this.setState({
        isArchived: ArchivedNewsFeedItemsStore.isArchived(this.props.id),
        isSubscribed: SubscriptionsStore.isSubscribed(this.props.id)
      });
    }
  },

  handleArchive: function() {
    let productSlug = this.props.product.slug;
    let itemId = this.props.id;

    if (this.state.isArchived) {
      NewsFeedItemActionCreators.unarchive(productSlug, itemId);
    } else {
      NewsFeedItemActionCreators.archive(productSlug, itemId);
    }
  },

  handleSubscribe: function() {
    let productSlug = this.props.product.slug;
    let itemId = this.props.id;

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
        {this.renderTags()}
        {this.renderDetails()}
        {this.renderFooter()}
        {this.renderComments()}
      </Tile>
    );
  },

  renderArchiveButton: function() {
    if (!ProductStore.isCoreTeam(UserStore.getUser())) {
      return;
    }

    // only turn on for posts
    if (this.props.target && this.props.target.type === 'post') {
      let text = 'Archive';
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
    let comment = this.props.last_comment

    if (comment) {
      return (
        <div className="px3 border-top">
          <ActivityFeedComment author={comment.user} body={comment.markdown_body} heartable={false} />
        </div>
      )
    }
  },

  renderEditButton: function() {
    if (ProductStore.isCoreTeam(UserStore.getUser()) || this.props.user.id === UserStore.getId()) {
      let target = this.props.target;

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

  renderTags: function() {
    let target = this.props.target
    let tags = target && (target.tags || target.marks);
    let tagItems;

    if (tags && tags.length) {
      tagItems = _.map(tags, function(tag) {
        return (
          <div className="inline-block" key={tag.id}>
            <Tag tag={tag} />
          </div>
        )
      })

      return (
        <div className="px3 pb3">
          {tagItems}
        </div>
      );
    }
  },

  renderDetails: function() {
    let target = this.props.target;

    let bountyValue = this.renderBountyValue();
    let commentsCount = this.renderCommentsCount();
    let share = this.renderShare();
    let heart = this.renderHeart();

    return (
      <div className="border-top clearfix">
        {bountyValue}

        <div className="right gray-2 h6 mt0 mb0" style={{ lineHeight: '24px' }}>
          {commentsCount}
          {share}
          {heart}
        </div>
      </div>
    )
  },

  renderBountyValue: function() {
    let target = this.props.target;

    if (target && target.type == 'task') {
      return (
        <div className="px3 left h4 mt0 mb0" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <AppCoins n={target.earnable_coins_cache} />
        </div>
      )
    }
  },

  renderCommentsCount: function() {
    let _commentsCount = function() {
      let commentsCount = this.props.comments_count
      let target = this.props.target;

      if (this.props.target && this.props.target.url) {
        return (
          <a href={this.props.target.url} className="gray-1">
            {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
          </a>
        );
      }

      return (
        <span>
          {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
        </span>
      );
    }.bind(this);

    return (
      <div className="px3 inline-block" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', fill: '#C2C7D0' }}>
        <SvgIcon type="comment" />
        <span className="ml1">
          {_commentsCount()}
        </span>
      </div>
    )
  },

  // TODO
  renderShare: function() {
  },

  renderHeart: function() {
    return (
      <div className="px3 inline-block border-left" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', fill: '#C2C7D0' }}>
        <Heart size="medium" heartable_id={this.props.id} heartable_type="NewsFeedItem" />
      </div>
    )
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

  renderModal: function() {
    let item = this.props
    let product = this.props.product
    let target = this.props.target

    let modalTarget;

    target.product = product

    switch (target.type) {
    case 'task':
      modalTarget = <Bounty
        key={target.id}
        bounty={target}
        noInvites={true}
        item={item}
        editCoins={false} />
      break
    case 'post':
      modalTarget = <Update update={target}
                            item={item}
                            newsFeedItem={item}
                            productSlug={product.slug} />
      break
    case 'team_membership':
      item.bio = target.bio;
      modalTarget = <Introduction introduction={item} />
      break
    default:
      modalTarget = <NewsFeedItem {...item}
                                  commentable={false}
                                  enableModal={false}
                                  productPage={true}
                                  showAllComments={false} />
      break
    }

    return (
      <Lightbox onHidden={this.onModalHidden} showControlledOuside={true}>
        <Discussion newsFeedItem={item}>{modalTarget}</Discussion>
      </Lightbox>
    );
  },

  renderSource: function() {
    let product = this.props.product

    if (!product) {
      return;
    }

    return (
      <a href={product.url} className="block clearfix border-bottom px3 py2">
        <div className="left mr2">
          <AppIcon app={product} size={18} />
        </div>
        <div className="overflow-hidden">
          <h6 className="black mt0 mb0">{product.name}</h6>
        </div>
      </a>
    );
  },

  renderSubscribeButton: function() {
    let user = UserStore.getUser();

    if (!user) {
      return (
        <li>
          <a href="/signup">Sign up</a>
        </li>
      );
    }

    // only turn on for posts
    if (this.props.target && this.props.target.type === 'post') {
      let text = 'Subscribe';
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
    let product = this.props.product;
    let target = this.props.target;
    let triggerModal = this.triggerModal;

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

  targetNoun: function(type) {
    let typeMap = this.typeMap;

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

module.exports = window.NewsFeedItem = NewsFeedItem;
