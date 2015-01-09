var AvatarWithUsername = require('./ui/avatar_with_username.js.jsx')
var BountyActionCreators = require('../actions/bounty_action_creators');
var BountyStore = require('../stores/bounty_store');
var Button = require('./ui/button.js.jsx')
var Markdown = require('./markdown.js.jsx');
var Icon = require('./icon.js.jsx');
var formatShortTime = require('../lib/format_short_time.js');
var SingleLineList = require('./ui/single_line_list.js.jsx')
var Label = require('./ui/label.js.jsx')
var Love = require('./love.js.jsx');
var routes = require('../routes')

var SubscriptionsStore = require('../stores/subscriptions_store')

var CLOSED_STATES = ['closed', 'resolved'];

var ONE_HOUR = 60 * 60 * 1000;

module.exports = React.createClass({
  displayName: 'Bounty',

  propTypes: {
    item: React.PropTypes.object.isRequired,
    noInvites: React.PropTypes.bool,
    showCoins: React.PropTypes.bool
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

  render: function() {
    var bounty = this.bounty()
    var currentUser = window.app.currentUser()

    var bountyValuation = null
    if (this.props.showCoins) {
      bountyValuation = <BountyValuation {...this.state.bounty} {...this.props.valuation} />
    }

    var lockMessage = null
    var worker = this.state.worker
    if (worker && !(this.state.closed || bounty.state === 'closed')) {
      if (currentUser && worker.id === currentUser.id) {
        lockMessage = (
          <div className="px3 py2 border-bottom border-gray-5 gray-1" style={{backgroundColor: '#F4FFC0'}}>
            <Icon icon="lock" /> You have a hold on this bounty held until {this.state.lockUntil.format('dddd [at] h a')} &mdash; <a href="javascript:void(0)" onClick={this.abandonWork}>release this bounty</a> or <a href="javascript:void(0)" onClick={this.extendWork}>extend for two days</a>
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
        <div className="border-bottom border-gray-5">
          <div className="clearfix border-bottom border-gray-5">
            <div className="left px3 py2 border-right border-gray-5">
              {bountyValuation}
            </div>

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

            <div className="mb3 h6 mt0 mb0">
              <AvatarWithUsername user={bounty.user} size={18} />
              {' '}
              <span className="gray-2">posted</span>
            </div>

            <h1 className="mt0 mb0" style={{ lineHeight: '36px' }}>
              {this.state.bounty.title}
              {' '}
              <a href={bounty.url} className="gray-3" style={{fontWeight: 'normal'}}>#{bounty.number}</a>
            </h1>

            <div className="py1 mb2">
              <SingleLineList items={_.map(this.state.bounty.tags, function(label) {
                return <Label name={label.name} />
              })} />
            </div>

            {this.renderDescription()}
          </div>

          {this.renderLove()}
        </div>

        {this.renderDiscussion()}
      </div>
    );
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

  renderDiscussion: function() {
    var item = this.props.item;
    var bounty = this.state.bounty;

    if (item) {
      return (
        <div id="discussion-view-el" key={'discussion-' + bounty.id}>
          <NewsFeedItemComments commentable={true} item={item} showAllComments={true} />
        </div>
      );
    }
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
            href={{ true: routes.product_update_unsubscribe_path({ product_id: this.bounty().product.slug, update_id: this.props.item.id }),
                   false: routes.product_update_subscribe_path({ product_id: this.bounty().product.slug, update_id: this.props.item.id }) }} />
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
        <div className="px3 py2 mb0 mt0 border-top">
          <Love heartable_id={this.props.item.id} heartable_type="NewsFeedItem" />
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
        return (
          <a href="#event_comment_body" className="block py1 green green-dark-hover">
            <Icon icon="check" /> Submit work
          </a>
        )
      } else {
        return <Button><Icon icon="lock" /> Locked for {formatShortTime(this.state.lockUntil)}</Button>
      }
    } else {
      return <Button action={this.startWork}>Work on this bounty</Button>
    }
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
      lockUntil: moment().add(60, 'hours').add(1, 'second')
    });
  }
});

window.Bounty = module.exports
