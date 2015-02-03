var AvatarWithUsername = require('./ui/avatar_with_username.js.jsx')
var BountyActionCreators = require('../actions/bounty_action_creators');
var BountyStore = require('../stores/bounty_store');
var Button = require('./ui/button.js.jsx')
var formatShortTime = require('../lib/format_short_time.js');
var Icon = require('./ui/icon.js.jsx');
var Heart = require('./heart.js.jsx');
var Trackable = require('./trackable.js.jsx')
var routes = require('../routes')
var SubscriptionsStore = require('../stores/subscriptions_store')
var TextPost = require('./ui/text_post.js.jsx')
var ToggleButton = require('./toggle_button.js.jsx')
var InviteFriendBounty = require('./invite_friend_bounty.js.jsx')

var CLOSED_STATES = ['closed', 'resolved']
var ONE_HOUR = 60 * 60 * 1000

var Bounty = React.createClass({

  propTypes: {
    item: React.PropTypes.object.isRequired,
    noInvites: React.PropTypes.bool,
    showCoins: React.PropTypes.bool
  },

  render: function() {
    var bounty = this.bounty()
    var currentUser = window.app.currentUser()

    var valuation = null
    if (this.props.showCoins) {
      valuation = (
        <div className="left px3 py2 border-right border-gray-5">
          <BountyValuation {...this.state.bounty} {...this.props.valuation} />
        </div>
      )
    }

    var lockMessage = null
    var worker = this.state.worker
    if (worker && !(this.state.closed || bounty.state === 'closed')) {
      if (currentUser && worker.id === currentUser.id) {
        lockMessage = (
          <div className="px3 py2 border-bottom border-gray-5 gray-1" style={{backgroundColor: '#F4FFC0'}}>
            <Icon icon="lock" /> You have a hold on this bounty until {this.state.lockUntil.format('dddd [at] h a')} &mdash; <a href="javascript:void(0)" onClick={this.abandonWork}>release this bounty</a> or <a href="javascript:void(0)" onClick={this.extendWork}>extend for two days</a>
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
            <ul className="list-inline mt0 mb0" style={{fontSize:13, lineHeight: '2rem'}}>
              {this.renderEditButton()}
              {this.renderOpenButton()}
              {this.renderFollowButton()}
              {this.renderInviteFriendButton()}
            </ul>
          </div>

          <div className="right px2 py1">
            {this.renderStartWorkButton()}
          </div>
        </div>

        {lockMessage}

        <div className="p3 px4">
          <TextPost author={bounty.user} timestamp={bounty.created_at} title={bounty.title} labels={bounty.tags} body={bounty.markdown_description} />
        </div>

        {this.renderLove()}
      </div>
    );
  },

  abandonWork: function(e) {
    var stopWorkUrl = this.bounty().stop_work_url;

    BountyActionCreators.call(e, 'bounty.abandoned', stopWorkUrl);

    this.setState({
      worker: null,
      lockUntil: null
    });
  },

  bounty: function() {
    var propBounty = this.props.bounty;
    var stateBounty = this.state && this.state.bounty || {};

    return _.extend(propBounty, stateBounty);
  },

  closeBounty: function(e) {
    e.stopPropagation();

    BountyActionCreators.closeBounty(this.props.bounty.number);
  },

  componentDidMount: function() {
    BountyStore.addChangeListener(this.getBountyState);
    SubscriptionsStore.addChangeListener(this.getSubscriptionState);
  },

  componentWillUnmount: function() {
    BountyStore.removeChangeListener(this.getBountyState);
    SubscriptionsStore.removeChangeListener(this.getSubscriptionState);
  },

  extendWork: function(e) {
    var lockUrl = this.bounty().lock_url;

    BountyActionCreators.call(e, 'bounty.extended', lockUrl);

    var extendUntil = moment().add(60 * ONE_HOUR);

    this.setState({
      lockUntil: extendUntil
    });
  },

  getBountyState: function() {
    var bounty = this.state.bounty;
    var state = BountyStore.getState();

    bounty.state = state || bounty.state;

    this.setState({
      bounty: bounty,
      closed: state === 'closed'
    });
  },

  getInitialState: function() {
    var bounty = this.bounty();

    return {
      // :<
      bounty: bounty,
      closed: (CLOSED_STATES.indexOf(bounty.state) !== -1 ? true : false),
      worker: bounty.workers && bounty.workers[0],
      lockUntil: moment(bounty.locked_at).add(60 * ONE_HOUR),
      subscribed: SubscriptionsStore.get(this.props.item.id)
    };
  },

  getSubscriptionState: function() {
    this.setState({
      subscribed: SubscriptionsStore.get(this.props.item.id)
    });
  },

  renderClosedNotice: function() {
    var bounty = this.state.bounty;
    var closed = bounty.state === 'resolved' || bounty.state === 'closed'

    if (!closed) {
      return
    }

    return (
      <li className="omega">
        <a href="#" className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      </li>
    )
  },

  renderDescription: function() {
    var bounty = this.state.bounty;

    if (bounty.markdown_description) {
      return <Markdown content={bounty.markdown_description} normalized="true" />;
    }

    return <div className="gray">No description yet</div>;
  },

  renderEditButton: function() {
    var bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li>
          <a href={bounty.edit_url}>Edit</a>
        </li>
      );
    }
  },

  renderFlagButton: function() {
    var bounty = this.state.bounty;
    var currentUser = window.app.currentUser();
    var isStaff = currentUser && currentUser.get('staff');

    if (isStaff) {
      return (
        <li className="alpha">
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

  renderFollowButton: function() {
    var currentUser = window.app.currentUser();
    var bounty = this.state.bounty;

    if (currentUser) {
      return (
        <li>
          <ToggleButton
            bool={this.state.subscribed}
            text={{ true: 'Unsubscribe', false: 'Subscribe' }}
            icon={{ true: '', false: '' }}
            classes={{ true: '', false: '' }}
            href={{ true: routes.product_update_unsubscribe_path({ product_id: bounty.product.slug, update_id: this.props.item.id }),
                   false: routes.product_update_subscribe_path({ product_id: bounty.product.slug, update_id: this.props.item.id }) }} />
        </li>
      );
    }
  },

  renderInviteFriendButton: function() {
    if (this.props.noInvites) {
      return null;
    }

    var bounty = this.state.bounty;
    var closed = bounty.state == 'resolved' || bounty.state == 'closed'

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

  renderLove: function() {
    if (this.props.item) {
      return (
        <div className="px4 py2 mb0 mt0 border-top">
          <Heart size="small" heartable_id={this.props.item.id} heartable_type="NewsFeedItem" />
        </div>
      );
    }
  },

  renderOpenButton: function() {
    var bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li>
          {this.renderOpenOrClosedButton()}
        </li>
      )
    }
  },

  renderOpenOrClosedButton: function() {
    var bounty = this.state.bounty;

    if (bounty.state !== 'closed' && !this.state.closed) {
      return <a href="javascript:void(0);" onClick={this.closeBounty}>Close</a>;
    }

    return <a href="javascript:void(0);" onClick={this.reopenBounty}>Reopen</a>;
  },

  renderPopularizeButton: function() {
    var item = this.props.item;

    if (item && window.app.staff()) {
      return (
        <li className="alpha">
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

  renderStartWorkButton: function() {
    var currentUser = window.app.currentUser();
    var bounty = this.bounty();

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

  reopenBounty: function(e) {
    e.stopPropagation();

    BountyActionCreators.reopenBounty(this.state.bounty.number);
  },

  startWork: function(e) {
    var currentUser = window.app.currentUser();
    var startWorkUrl = this.bounty().start_work_url;

    BountyActionCreators.call(e, 'bounty.started', startWorkUrl);

    this.setState({
      worker: currentUser && currentUser.attributes,
      lockUntil: moment().add(60, 'hours')
    });
  },

  requestReview: function() {
    BountyActionCreators.submitWork(this.props.bounty.url + '/review')
  }
})

module.exports = window.Bounty = Bounty
