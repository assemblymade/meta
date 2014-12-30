var BountyActionCreators = require('../actions/bounty_action_creators');
var BountyStore = require('../stores/bounty_store');
var Markdown = require('./markdown.js.jsx');
var Icon = require('./icon.js.jsx');
var formatShortTime = require('../lib/format_short_time.js');
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
    var bounty = this.bounty();

    return (
      <div>
        <div className="p3 border-bottom">
          <ul className="list-inline mb2" style={{ marginBottom: '6px' }}>
            {this.renderBountyValuation()}
            <li>
              {this.renderTagList()}
            </li>
            <li className="text-muted" style={{ fontSize: '14px', color: '#a5a5a5' }}>
              Created by
              {' '}
              <a className="text-stealth-link" href={bounty.user.url}>@{bounty.user.username}</a>
              {' '}
              {moment(bounty.created).fromNow()}
            </li>
          </ul>

          <h1 className="mt0 mb0" style={{ fontWeight: 'normal' }}>
            {this.state.bounty.title}
            {' '}
            <small style={{ fontSize: '85%' }}>
              <a href={bounty.url} className="gray">#{bounty.number}</a>
            </small>
          </h1>
        </div>

        <div className="p3">
          {this.renderDescription()}
        </div>
        {this.renderLove()}
        {this.renderFooter()}
        {this.renderDiscussion()}
      </div>
    );
  },

  renderBountyValuation: function() {
    if (this.props.showCoins) {
      return (
        <li className="text-large">
          <BountyValuation {...this.state.bounty} {...this.props.valuation} />
        </li>
      );
    }
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

  toggleLiked: function(e) {
    var $likeData = document.querySelector('.like-data'),
        $likeList = document.querySelector('.like-list');

    e.preventDefault();
    $likeData.classList.toggle('_open');
    $likeData.classList.toggle('_mb0_5');

    if ($likeList.classList.contains('_open') === true) {
      $likeList.classList.toggle('_open');
      $likeList.classList.toggle('_mb1_5');
      $likeList.classList.toggle('_mtn0_25');
    };
  },
  toggleLikeList: function(e) {
    var $likeList = document.querySelector('.like-list');

    e.preventDefault();
    $likeList.classList.toggle('_open');
    $likeList.classList.toggle('_mb1_5');
    $likeList.classList.toggle('_mtn0_25');
  },

  renderDiscussion: function() {
    var item = this.props.item;
    var bounty = this.state.bounty;

    {{/*
      --- Handoff - Styles for Page Comments
      --- Component CSS: app/assets/stylesheets/components/comments.scss
      --- OOCSS: app/assets/stylesheets/asmcss/_nocss.scss

      --- Check @whale's latest style guide & card unification comps for additional insight

      --- Comments are used below to help identify sections. Delete whatever isn't useful.
      --- Any questions? Ping Dustin.

      JS functions (convert):
        toggleLiked
        toggleLikeList
    */}}

    if (item) {
      return (
        <div className="discussion _p0" id="discussion-view-el" key={'discussion-' + bounty.id}>
          {{/* comments - header */}}
          <div className="comments-header _ml3 _mr0_25 _pt3 _border-left0_3 border-gray-6 _mq-600_ml4 _mq-600_mr2">
            <div className="_mx2 _clearfix">
              {{/* comments header group */}}
              <div className="_pos-relative _float-left">
                <div style={{/* bullet */}} className="_pos-absolute _pos-t0 _pos-ln3 _w1_5 _ht1_5 _mt0_25 _ml0_1 _img-circle bg-white _border0_25 border-gray-6"></div>
                <div style={{/* comment count */}} className="_h6 _strong">
                  <span className="_mr0_5 gray-3">
                    <Icon icon="comment" />
                  </span>
                  24 comments
                </div>
              </div>
              {{/* comments filter */}}
              <ul className="comments-filter _list-reset _list-inline _list-ml1_25 _text-align-right _h6 fw-500 _mq-600_float-right">
                <li style={{marginLeft:'0'}}>
                  <a className="active" href="#">Oldest</a>
                </li>
                <li>
                  <a href="#">Newest</a>
                </li>
                <li className="_mrn1 _mq-600_mr0">
                  <a className="_none _mq-600_inline-block" href="#">Liked</a>
                </li>
                <li className="_mrn1 _mq-600_mr0">
                  <a className="_none _mq-600_inline-block" href="#">Work Submitted</a>
                </li>
              </ul>
            </div>
          </div>
          {{/* comments - main */}}
          <div className="_ml3 _mr0_25 _pt3 _border-left0_3 border-gray-6 _mq-600_ml4 _mq-600_mr2">
            <div className="_mx2">
              {{/* post */}}
              <div className="_hover-toggle">
                {{/* post header */}}
                <div className="_mb0_5">
                  {{/* post header top */}}
                  <div className="_table _table-fixed w100p _mb0_25">
                    <div className="_pos-relative _table-cell _valign-top">
                      <img className="_pos-absolute _pos-t0 _pos-ln3_5 _w2_5 _ht2_5 _mtn0_25 _ml0_1 _img-circle bg-black" src="https://gravatar.com/avatar/ce343ede8b5f01dd9d8882d57868f37a?d=https%3A%2F%2Fassembly.com%2Fassets%2Favatars%2Fdefault.png&amp;s=60" />
                      <a href="#" className="_username _inline-block _mr0_5 _h6 _strong black">
                        dustintheweb
                      </a>
                      <div className="_inline-block _mb0_25 _h6 gray-2">
                        <div className="likes _inline-block _mr0_75">
                          <div style={{/* heart counter */}} className="_inline-block _mr0_75">
                            <span className="_mr0_25 red">
                              <Icon icon="heart" />
                            </span>
                            <div style={{/* heart count */}} className="_inline-block gray-2 _pr0_75 _border-right1px border-gray-4">2</div>
                          </div>
                          <a className="_pr0_75 _border-right1px border-gray-4" onClick={this.toggleLiked} href="#">Like</a>
                        </div>
                        <div className="_reply _inline-block">
                          <a href="#">Reply</a>
                        </div>
                      </div>
                    </div>
                    <div style={{/* timestamp */}} className="_none _h6 _valign-top _w15 _text-align-right _mq-768_table-cell">
                      <div className="_timestamp _none gray-2 _hover-toggle-item-block">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                  {{/* post header main */}}
                  <div style={{/* liked details */}} className="like-data _h6 gray-1 _mh0 _overflow-hidden">
                    <a className="_inline-block _strong black" href="#">
                      <img className="_inline-block _img-circle _w1_5 _mr0_75 bg-black" src="https://gravatar.com/avatar/ce343ede8b5f01dd9d8882d57868f37a?d=https%3A%2F%2Fassembly.com%2Fassets%2Favatars%2Fdefault.png&amp;s=36" />
                      <span className="_inline-block _valign-middle">You</span>
                    </a>
                    <a className="_inline-block _valign-middle _strong black" href="#">, Whale</a>
                    <div className="_inline-block _valign-middle">&nbsp;and&nbsp;
                      <a onClick={this.toggleLikeList} href="#">16 others</a> like this.
                    </div>
                  </div>
                  <div style={{/* liked avatars */}} className="like-list _mh0 _overflow-hidden">
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-lavender" src="https://s3.amazonaws.com/uifaces/faces/twitter/brad_frost/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-rose" src="https://s3.amazonaws.com/uifaces/faces/twitter/csswizardry/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-orange" src="https://s3.amazonaws.com/uifaces/faces/twitter/mlane/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-green" src="https://s3.amazonaws.com/uifaces/faces/twitter/whale/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-brown" src="https://s3.amazonaws.com/uifaces/faces/twitter/motherfuton/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-teal" src="https://s3.amazonaws.com/uifaces/faces/twitter/putorti/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-blue" src="https://s3.amazonaws.com/uifaces/faces/twitter/idiot/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-purple" src="https://s3.amazonaws.com/uifaces/faces/twitter/vladarbatov/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-lavender" src="https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-rose" src="https://s3.amazonaws.com/uifaces/faces/twitter/dancounsell/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-orange" src="https://s3.amazonaws.com/uifaces/faces/twitter/boheme/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-green" src="https://s3.amazonaws.com/uifaces/faces/twitter/chadengle/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-brown" src="https://s3.amazonaws.com/uifaces/faces/twitter/peterlandt/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-teal" src="https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-blue" src="https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg" />
                    </a>
                    <a className="_inline-block _mr0_5" href="#">
                      <img className="_inline-block _valign-middle _w1_5 _ht1_5 _img-circle bg-accent-purple" src="https://s3.amazonaws.com/uifaces/faces/twitter/sindresorhus/128.jpg" />
                    </a>
                  </div>
                </div>
                {{/* post main */}}
                <div className="_mb2_5">
                  <p className="_mb2 _text-2">
                    <a href="#">@mdeiters</a> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do <strong>eiusmod tempor incididunt</strong> ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  {{/* quote */}}
                  <div className="_mb2 _mln4_5 _text-2 _italic gray-1 _clearfix">
                    <div style={{/* bullet */}} className="_float-left">
                      <img className="_none _mr1 _mt0_25 _w1_25 _valign-top _mq-768_inline-block " src="/assets/icon-comment-quote.png" />
                    </div>
                    <div className="_mln0_05">
                      <div className="_ml2_25 _pl2 _pb0_25 _border-left0_3 border-aqua">
                        Here’s a quote about something from before that you should feel really special about, don’t you think?
                      </div>
                    </div>
                  </div>
                  {{/* img upload */}}
                  <div className="_clearfix _mb2">
                    <a href="#">
                      <img src="http://placehold.it/1000x800/c2c7d0/8B909A&text=image upload" />
                    </a>
                    <div style={{/* img data */}}  className="_mt0_25">
                      <a className="_float-left _h6" href="#">
                        <span className="_caps">jpg</span> - 124kb
                      </a>
                      <a className="_float-right _h6 gray-2" href="#">Add File to Assets</a>
                    </div>
                  </div>
                  <p className="_mb2 _text-2">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do cc / <a href="#">@whale</a> & <a href="#">@chrislloyd</a>
                  </p>
                  <div style={{/* comment data */}} className="_pos-relative _h6 _clearfix">
                    <div style={{/* bullet */}} className="_pos-absolute _pos-t0 _pos-ln3 _w1_5 _ht1_5 _mt0_25 _ml0_1 _img-circle bg-white _border0_25 border-gray-6"></div>
                    <div className="_example-1 none gray-2">
                      About 14 hours ago - viewed by <a href="#">23 people</a>
                    </div>
                    <div className="_example-2 gray-2">
                      <a className="_strong black" href="#">mdeiters</a> mentioned this in task <strong>Improve contributor onboarding</strong> <a href="#">#918</a>
                    </div>
                  </div>
                </div>
                <hr className="my0 _mrn2_25 _mln5_5 border-gray-5 _mq-600_mrn4 _mq-600_mln6_5"/>
              </div>
            {{/* end post */}}
            </div>
          </div>
          {{/* comments - footer */}}
          <div className="comments-footer _pos-relative _ml3 _mr0_25 _py3 _border-left0_3 border-gray-6 _mq-600_ml4 _mq-600_mr2">
            <div className="_mx2 _clearfix">
              {{/* comments footer main */}}
              <div className="_pos-relative _mb1">
                <img className="_pos-absolute _pos-t0 _pos-ln3_5 _w2_5 _ht2_5 _ml0_1 _img-circle bg-black" src="https://gravatar.com/avatar/ce343ede8b5f01dd9d8882d57868f37a?d=https%3A%2F%2Fassembly.com%2Fassets%2Favatars%2Fdefault.png&amp;s=60" />
                <textarea type="text" placeholder="Leave Your Comments" className="_overflow-hidden _ht14_5 _w100p _px1_5 _pt1 _pb0 _break-word _resize-none _text-2 gray-2 bg-gray-6 _border-none _border-rad0_5"></textarea>
              </div>
              <button type="button" className="pill-button pill-button-theme-white pill-button-border pill-button-shadow _float-right">
                <span className="title _fs1_1 _lh2">Leave a comment</span>
              </button>
            </div>
          </div>
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

  renderFooter: function() {
    if (window.app.currentUser()) {
      return (
        <div className="card-footer p3 clearfix">
          <div className="left">
            {this.renderStartWorkButton()}
          </div>

          <ul className="list-inline mt0 mb0 py1 right">
            {this.renderEditButton()}
            {this.renderOpenButton()}
            {this.renderFollowButton()}
            {this.renderInviteFriendButton()}
          </ul>
        </div>
      );
    }

    return <div className="border-bottom" />;
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
        <a className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      );
    }

    if (!currentUser) {
      return;
    }

    if (!this.state.worker) {
      return (
        <button className="btn btn-success mr2" type="button" onClick={this.startWork}>
          Work on this bounty
        </button>
      );
    }

    var worker = this.state.worker;

    if (worker.id === currentUser.id) {
      return (
        <div className="clearfix">
          <a className="btn btn-default left mr2"
              style={{ color: '#5CB85C !important', border: '1px solid #d3d3d3' }}
              type="button"
              data-scroll="true"
              data-target="#event_comment_body">
            <span className="icon icon-document icon-left"></span>
            Submit work for review
          </a>
          <div className="left h6 mt0 mb0 gray-darker">
            <Icon icon="lock" />
            {' '}
            We'll hold this task for you till {this.state.lockUntil.format('dddd [at] h a')}
            <br />
            <a href="javascript:void(0)" onClick={this.extendWork}>Hold until two days from now</a>
            {' '}
            or
            {' '}
            <a href="javascript:void(0)" onClick={this.abandonWork}>Release task</a>
          </div>
        </div>
      );  // '
    }

    return (
      <div className="py1 gray">
        <span className="mr1"><Icon icon="lock" /></span>
        {' '}
        <a className="gray-darker" href={worker.url}>
          <span style={{ opacity: '0.7' }}>
            <Avatar user={worker} style={{ display: 'inline' }} />
          </span>
          {' '} @{worker.username}
        </a>
        {' '} has {formatShortTime(this.state.lockUntil)} to work on this
      </div>
    )
  },

  renderTagList: function() {
    var bounty = this.state.bounty;
    var tags = _.map(bounty.tags, function(tag) { return tag.name });

    return (
      <TagList
        filterUrl={this.props.item.product.wips_url}
        destination={true}
        tags={tags}
        newBounty={true}
        url={bounty.tag_url} />
    );
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
