'use strict';

const AvatarWithUsername = require('./ui/avatar_with_username.js.jsx');
const BountyActionCreators = require('../actions/bounty_actions');
const BountyStore = require('../stores/bounty_store');
const Button = require('./ui/button.js.jsx');
const CreateBounty = require('./create_bounty.js.jsx');
const FloatingUserSelector = require('./floating_user_selector.js.jsx');
const formatShortTime = require('../lib/format_short_time.js');
const Heart = require('./heart.js.jsx');
const Icon = require('./ui/icon.js.jsx');
const InviteFriendBounty = require('./invite_friend_bounty.js.jsx');
const ProductStore = require('../stores/product_store');
const routes = require('../routes');
const SubscriptionsStore = require('../stores/subscriptions_store');
const TextPost = require('./ui/text_post.js.jsx');
const ToggleButton = require('./toggle_button.js.jsx');
const Trackable = require('./trackable.js.jsx');
const UserStore = require('../stores/user_store');

const CLOSED_STATES = ['closed', 'resolved']
const ONE_HOUR = 60 * 60 * 1000

let Bounty = React.createClass({
  propTypes: {
    bounty: React.PropTypes.shape({
      user: React.PropTypes.object,
    }),
    item: React.PropTypes.object.isRequired,
    noInvites: React.PropTypes.bool
  },

  statics: {
    showCreateBounty(product) {
      let averageBounty = product.average_bounty;
      let bountyValuationSteps = product.bounty_valuation_steps;
      let coinsMinted = product.coins_minted;
      let name = product.name;
      let profitLastMonth = product.profit_last_month;
      let slug = product.slug;

      window.analytics.track(
        'product.wip.showed_bounty_modal',
        { product: slug }
      );

      try {
        $('#create-bounty-modal').modal('show');
      } catch (e) {}

      React.render(
        CreateBounty({
          key: 'create-bounty-modal',
          id: 'create-bounty-modal',
          product: { name: name },
          url: `/${slug}/bounties`,
          maxOffer: Math.round(6 * averageBounty),
          averageBounty: averageBounty,
          coinsMinted: coinsMinted,
          profitLastMonth: profitLastMonth,
          steps: bountyValuationSteps
        }),
        document.getElementById('create-modal-placeholder')
      );
    }
  },

  abandonWork(e) {
    let stopWorkUrl = this.state.bounty.stop_work_url;
    e.preventDefault();

    BountyActionCreators.call('bounty.abandoned', stopWorkUrl);

    this.setState({
      worker: null,
      lockUntil: null
    });
  },

  closeBounty(e) {
    e.stopPropagation();

    BountyActionCreators.closeBounty(this.state.bounty.number);
  },

  componentDidMount() {
    BountyStore.addChangeListener(this.getBounty);
    SubscriptionsStore.addChangeListener(this.getSubscriptionState);
  },

  componentWillUnmount() {
    BountyStore.removeChangeListener(this.getBounty);
    SubscriptionsStore.removeChangeListener(this.getSubscriptionState);
  },

  extendWork(e) {
    let lockUrl = this.state.bounty.lock_url;
    e.preventDefault();

    BountyActionCreators.call('bounty.extended', lockUrl);

    let extendUntil = moment().add(60 * ONE_HOUR);

    this.setState({
      lockUntil: extendUntil
    });
  },

  getBounty() {
    if (!this.isMounted()) {
      return
    }
    let bounty = BountyStore.getBounty();

    this.setState({
      bounty: bounty,
      closed: !bounty.open
    });
  },

  getInitialState() {
    let bounty = BountyStore.getBounty();

    return {
      bounty: bounty,
      closed: (CLOSED_STATES.indexOf(bounty.state) !== -1 ? true : false),
      worker: bounty.workers && bounty.workers[0],
      lockUntil: moment(bounty.locked_at).add(60 * ONE_HOUR),
      subscribed: SubscriptionsStore.get(this.props.item.id)
    };
  },

  getSubscriptionState() {
    this.setState({
      subscribed: SubscriptionsStore.get(this.props.item.id)
    });
  },

  render() {
    let bounty = this.state.bounty;

    // fail-over for modals :(
    if (_.isEmpty(bounty)) {
      bounty = this.props.bounty;
    }

    let currentUser = UserStore.getUser();

    let valuation = (
      <div className="left px3 py2 border-right border-gray-5">
        <BountyValuation {...bounty} {...this.props.valuation} allowEditing={currentUser && currentUser.is_core} />
      </div>
    )

    let lockMessage = null
    let worker = this.state.worker

    if (worker && !(this.state.closed || bounty.state === 'closed')) {
      if (currentUser && worker.id === currentUser.id) {
        lockMessage = (
          <div className="px3 py2 border-bottom border-gray-5 gray-1" style={{backgroundColor: '#F4FFC0'}}>
            <Icon icon="lock" /> You have a hold on this bounty until {this.state.lockUntil.format('dddd [at] h a')} &mdash; <a href="javascript:void(0)" onClick={this.abandonWork}>release this bounty</a> or <a href="javascript:void(0)" onClick={this.extendWork}>hold until two days from now</a>
          </div>
        )
      } else {
        lockMessage = (
          <div className="px3 py2 border-bottom border-gray-5 gray-1" style={{backgroundColor: '#F4FFC0'}}>
            <AvatarWithUsername user={worker} /> has {formatShortTime(this.state.lockUntil)} to work on this bounty.
          </div>
        )
      }
    }

    return (
      <div className="bg-white rounded">
        <div className="clearfix border-bottom border-gray-5">
          {valuation}

          <div className="left px3 py2">
            <ul className="list-reset list-inline mt0 mb0 h6" style={{lineHeight: '2rem'}}>
              {this.renderEditButton()}
              {this.renderCloseButton()}
              {this.renderFollowButton()}
              {this.renderInviteFriendButton()}
            </ul>
          </div>

          <div className="right px2 py1" style={{position:'relative'}}>
            {this.renderStartWorkButton()}
            {this.state.selectingLocker && <FloatingUserSelector
                onUserSelected={this.assignUser}
                onRequestClose={this.hideLockSelector}/>}
          </div>
          <div className="right px2 py1">
            <div className="left mr2">
              <Button action={Bounty.showCreateBounty.bind(null, ProductStore.getProduct())} block={true}>New bounty</Button>
            </div>
          </div>
        </div>

        {lockMessage}

        <div className="p4">
          <TextPost author={bounty.user}
            timestamp={bounty.created_at}
            title={bounty.title}
            labels={bounty.tags}
            body={bounty.markdown_description} />
        </div>
      </div>
    );
  },

  renderClosedNotice() {
    let bounty = this.state.bounty;

    if (!bounty.open) {
      return (
        <li className="mb0">
          <a href="#" className="btn btn-default disabled">
            {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
          </a>
        </li>
      );
    }
  },

  renderDescription() {
    let bounty = this.state.bounty;

    if (bounty.markdown_description) {
      return <Markdown content={bounty.markdown_description} normalized="true" />;
    }

    return <div className="gray">No description yet</div>;
  },

  renderEditButton() {
    let bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li className="left">
          <a href={bounty.edit_url}>Edit</a>
        </li>
      );
    }
  },

  renderFlagButton() {
    let bounty = this.state.bounty;

    if (UserStore.isStaff()) {
      return (
        <li className="mt0">
          <ToggleButton
            bool={bounty.flagged}
            text={{ true: 'Unflag', false: 'Flag' }}
            classes={{ true: '', false: '' }}
            icon={{ true: 'flag', false: 'flag' }}
            href={{ true: bounty.unflag_url, false: bounty.flag_url }} />
        </li>
      );
    }
  },

  renderFollowButton() {
    let currentUser = UserStore.getUser();
    let bounty = this.state.bounty;
    let product = ProductStore.getProduct();

    if (currentUser) {
      return (
        <li>
          <ToggleButton
            bool={this.state.subscribed}
            text={{ true: 'Unsubscribe', false: 'Subscribe' }}
            icon={{ true: '', false: '' }}
            classes={{ true: '', false: '' }}
            href={{ true: routes.product_update_unsubscribe_path({ product_id: product.slug, update_id: this.props.item.id }),
                   false: routes.product_update_subscribe_path({ product_id: product.slug, update_id: this.props.item.id }) }} />
        </li>
      );
    }
  },

  renderInviteFriendButton() {
    if (this.props.noInvites) {
      return null;
    }

    let bounty = this.state.bounty;

    if (bounty.open) {
      return (
        <li>
          <InviteFriendBounty
              url={'/user/invites'}
              invites={bounty.invites}
              via_type={'Wip'}
              via_id={bounty.id} />
        </li>
      );
    }
  },

  renderLove() {
    if (this.props.item) {
      return (
        <div className="px4 py2 mb0 mt0 border-top">
          <Heart size="small" heartable_id={this.props.item.id} heartable_type="NewsFeedItem" />
        </div>
      );
    }
  },

  renderCloseButton() {
    let bounty = this.state.bounty;

    if (bounty.can_update && bounty.open) {
      return (
        <li className="block px1 gray-2">
          <a href="javascript:void(0);" onClick={this.closeBounty}>Close</a>
        </li>
      )
    }
  },

  renderPopularizeButton() {
    let item = this.props.item;

    if (item && UserStore.isStaff()) {
      return (
        <li className="mt0">
          <ToggleButton
            bool={item.popular_at !== null}
            text={{ true: 'Depopularize', false: 'Popularize' }}
            classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
            icon={{ true: 'thumbs-down', false: 'fire' }}
            href={{ true: item.url + '/depopularize', false: item.url + '/popularize' }} />
        </li>
      );
    }
  },

  renderStartWorkButton() {
    let bounty = this.state.bounty;
    let currentUser = UserStore.getUser();
    let isCore = ProductStore.isCoreTeam(currentUser);

    if (this.state.closed || !bounty.open) {
      if (isCore) {
        return (
          <Button action={this.reopenBounty}>
            Closed — Reopen?
          </Button>
        );
      }

      return (
        <Button>
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </Button>
      );
    }

    if (!currentUser) {
      return;
    }

    if (this.state.worker) {
      if (this.state.worker.id == currentUser.id) {
        if (bounty.state == "reviewing") {
          return <Button>Core Team review requested</Button>
        }
        return <Button action={this.requestReview}>Request Core Team review</Button>
      }

      return <Button><Icon icon="lock" /> Locked for {formatShortTime(this.state.lockUntil)}</Button>
    }

    if (isCore) {
      return <Button action={this.assignToUser} type="primary">Assign to user</Button>
    }
    return <Button action={this.startWork} type="primary">Assign to me</Button>
  },

  reopenBounty(e) {
    e.stopPropagation();

    BountyActionCreators.reopenBounty(this.state.bounty.number);
  },

  assignUser(user) {
    BountyActionCreators.assign(this.state.bounty.product.slug, this.state.bounty.number, user.id);

    this.setState({
      worker: user,
      lockUntil: moment().add(60, 'hours'),
      selectingLocker: false
    });
  },

  hideLockSelector() {
    this.setState({selectingLocker: false})
  },

  startWork(e) {
    e.preventDefault();
    this.assignUser(UserStore.getUser())
  },

  assignToUser(e) {
    e.preventDefault()

    this.setState({
      selectingLocker: true
    })
  },

  requestReview() {
    BountyActionCreators.submitWork(this.state.bounty.url + '/review')
  }
})

module.exports = window.Bounty = Bounty
