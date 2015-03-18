'use strict';

const AvatarWithUsername = require('./ui/avatar_with_username.js.jsx');
const BountyActionCreators = require('../actions/bounty_action_creators');
const BountyStore = require('../stores/bounty_store');
const Button = require('./ui/button.js.jsx');
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
    noInvites: React.PropTypes.bool,
    showCoins: React.PropTypes.bool
  },

  abandonWork(e) {
    let stopWorkUrl = this.state.bounty.stop_work_url;

    BountyActionCreators.call(e, 'bounty.abandoned', stopWorkUrl);

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

    BountyActionCreators.call(e, 'bounty.extended', lockUrl);

    let extendUntil = moment().add(60 * ONE_HOUR);

    this.setState({
      lockUntil: extendUntil
    });
  },

  getBounty() {
    let bounty = BountyStore.getBounty();

    this.setState({
      bounty: bounty,
      closed: bounty.state === 'closed'
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

    if (_.isEmpty(bounty)) {
      bounty = this.props.bounty; // fail-over for modals :(
    }

    let currentUser = UserStore.getUser();

    let valuation = null
    if (this.props.showCoins) {
      valuation = (
        <div className="left px3 py2 border-right border-gray-5">
          <BountyValuation {...bounty} {...this.props.valuation} />
        </div>
      )
    }

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
              {this.renderOpenButton()}
              {this.renderFollowButton()}
              {this.renderInviteFriendButton()}
            </ul>
          </div>

          <div className="right px2 py1">
            <div className="left mr2">
              <Button action={window.showCreateBounty} block={true}>New bounty</Button>
            </div>
            {this.renderStartWorkButton()}
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
    let closed = bounty.state === 'resolved' || bounty.state === 'closed'

    if (!closed) {
      return
    }

    return (
      <li className="mb0">
        <a href="#" className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      </li>
    )
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
    let currentUser = window.app.currentUser();
    let isStaff = currentUser && currentUser.get('staff');

    if (isStaff) {
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
    let closed = bounty.state == 'resolved' || bounty.state == 'closed'

    if (!closed) {
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

  renderOpenButton() {
    let bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li className="block px1 gray-2">
          {this.renderOpenOrClosedButton()}
        </li>
      )
    }
  },

  renderOpenOrClosedButton() {
    let bounty = this.state.bounty;

    if (bounty.state !== 'closed' && !this.state.closed) {
      return <a href="javascript:void(0);" onClick={this.closeBounty}>Close</a>;
    }

    return <a href="javascript:void(0);" onClick={this.reopenBounty}>Reopen</a>;
  },

  renderPopularizeButton() {
    let item = this.props.item;

    if (item && window.app.staff()) {
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
    let currentUser = UserStore.getUser();
    let bounty = this.state.bounty;

    if (this.state.closed || bounty.state === 'closed') {
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

        return (
          <Button action={this.requestReview}>Request Core Team review</Button>
        );
      }

      return <Button><Icon icon="lock" /> Locked for {formatShortTime(this.state.lockUntil)}</Button>
    }

    return <Button action={this.startWork} type="primary">Work on this bounty</Button>
  },

  reopenBounty(e) {
    e.stopPropagation();

    BountyActionCreators.reopenBounty(this.state.bounty.number);
  },

  startWork(e) {
    let currentUser = UserStore.getUser();
    let startWorkUrl = this.state.bounty.start_work_url;

    BountyActionCreators.call(e, 'bounty.started', startWorkUrl);

    this.setState({
      worker: currentUser,
      lockUntil: moment().add(60, 'hours')
    });
  },

  requestReview() {
    BountyActionCreators.submitWork(this.state.bounty.url + '/review')
  }
})

module.exports = window.Bounty = Bounty
