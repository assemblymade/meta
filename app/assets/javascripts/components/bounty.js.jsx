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

  renderDiscussion: function() {
    var item = this.props.item;
    var bounty = this.state.bounty;


    {{/*

      Handoff - New comment styles
      Component CSS: app/assets/stylesheets/components/comments.scss
      OOCSS: app/assets/stylesheets/asmcss/_nocss.scss

      Any questions? Ping Dustin!

      */}}

    if (item) {
      return (
        <div className="discussion _p0" id="discussion-view-el" key={'discussion-' + bounty.id}>
          <div className="comments _ml3 _mr0_25 _py3 _border-left0_5 border-gray-6 _mq-600_ml4 _mq-600_mr2">
            <div className="inner-comments _mx2">  
              <div className="comments-nav _clearfix _mb1_75">
                <div className="_float-left _mln3">
                  <div className="bullet _float-left _mt0_25 _img-circle _w1_5 _ht1_5 bg-white _border0_25 border-gray-6"></div> 
                  <div className="comments-count _ml3 _h6 _strong">
                    <img className="_chat-icon" />
                    20 comments
                  </div>
                </div>
                <ul className="comments-filter _list-reset _list-inline _list-ml1_25 _text-align-right _h6 fw-500 _mq-600_float-right">
                  <li style={{marginLeft:'0'}}>
                    <a className="active" href="#">Oldest</a>
                  </li>
                  <li>
                    <a href="#">Newest</a>
                  </li>
                  <li className="_mrn1 _mq-600_mr0">
                    <a className="_none _mq-600_inline-block" href="">Liked</a>
                  </li>
                  <li className="_mrn1 _mq-600_mr0">
                    <a className="_none _mq-600_inline-block" href="">Work Submitted</a>
                  </li>
                </ul>
              </div>
              <div className="comment">
                <div className="comment-header">
                  <div className="comment-header-top _clearfix">

                    <div className="_table _table-fixed w100p">
                      <div className="_table-cell _valign-top">
                        <div className="_mln3_5 _clearfix">
                          <div className="bullet _float-left _w2_5 _ht2_5 _mtn0_25 _img-circle bg-black"></div>
                          <div className="_ml3_5">
                            <a href="" className="_username _inline-block _mr0_5 _h6 _strong black"> 
                              dustintheweb
                            </a>
                            <div className="_inline-block _mb0_25 _h6 gray-2">
                              <div className="likes _inline-block _mr0_75">
                                <div className="_heart-count _inline-block _mr0_75">
                                  <img className="_heart-icon _inline-block _m0_25" src="" />
                                  <div className="_heart-count _inline-block gray-2 _pr0_75 _border-right1px border-gray-4">2</div>
                                </div>
                                <a className="gray-2 _pr0_75 _border-right1px border-gray-4" href="#">Like</a>
                              </div>
                              <div className="_reply _inline-block">
                                <a className="gray-2" href="">Reply</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="_none _h6 _valign-top _w15 _text-align-right _mq-768_table-cell">
                        <a href="#" className="_timestamp gray-2">
                          2 hours ago
                        </a>
                      </div>
                    </div>
                  </div> 
                    
                  <div className="_comment-header-core _mb1_25">
                    <div className="_like-data _h6 gray-1">
                      <a className="_inline-block _strong black" href="#">
                        <img className="_inline-block _img-circle _w1_5 _mr0_75" src="https://gravatar.com/avatar/ce343ede8b5f01dd9d8882d57868f37a?d=https%3A%2F%2Fassembly.com%2Fassets%2Favatars%2Fdefault.png&amp;s=36" />
                        <span className="_inline-block _valign-middle">You</span>
                      </a>
                      <a className="_inline-block _valign-middle _strong black" href="">, Whale</a>
                      <div className="_inline-block _valign-middle">&nbsp;and <a href="#">16 others</a> like this.</div>
                    </div>
                    <div className="_like-avatars _mt0_25">
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#808fb2'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#b87c7a'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#ea8247'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#89b87a'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#7f704d'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#478385'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#157db8'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#764785'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#808fb2'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#b87c7a'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#ea8247'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#89b87a'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#7f704d'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#478385'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#157db8'}}></div>
                      </a>
                      <a className="_inline-block _mr0_5" href="">
                        <div className="_bullet _inline-block _valign-middle _w1_5 _ht1_5 _img-circle" style={{backgroundColor:'#764785'}}></div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="_comment-core _mb2">
                  <p className="_mb2 _text-2">  
                    <a href="">@mdeiters</a> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do <strong>eiusmod tempor incididunt</strong> ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <div className="_quote _mb2 _mln4_75 _text-2 _italic gray-1 _clearfix">
                    <div className="_quote-bullet _float-left">
                      <img className="_mr1" src="http://placehold.it/16x13/53cbdd/53cbdd&text=no" />
                    </div>
                    <div className="_ml2_25 _pl2 _border-left0_5" style={{borderColor:'#53cbdd'}}>
                      Here’s a quote about something from before that you should feel really special about, don’t you think?
                    </div>
                  </div>
                  <div className="_image-upload _clearfix _mb2">
                    <a href="">
                      <img src="http://placehold.it/1000x800/c2c7d0/8B909A&text=Image Upload" />
                    </a>
                    <div className="_image-data _mt0_25">
                      <a className="_float-left _h6" href="#">
                        <span className="_caps">jpg</span> - 124kb
                      </a>
                      <a className="_float-right _h6 gray-2" href="#">Add File to Assets</a>
                    </div>
                  </div>
                  <p className="_mb2 _text-2">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do cc / <a href="">@whale</a> & <a href="">@chrislloyd</a>
                  </p>
                  <div className="_comment-data _mln3 _h6 _clearfix">
                    <div className="_bullet _float-left _mt0_25 _img-circle _w1_5 _ht1_5 bg-white _border0_25 border-gray-6"></div>
                    <div className="_example-1 none _ml3 gray-2">                      
                      About 14 hours ago - viewed by <a href="">23 people</a>
                    </div>
                    <div className="_example-2 _ml3 gray-2">
                      <a className="_strong black" href="#">mdeiters</a> mentioned this in task <strong>Improve contributor onboarding</strong> <a href="">#918</a>
                    </div>
                  </div>
                </div>
                <div className="_comment-footer">
                  <div className="_comment-footer-core">
                    <img className="_avatar" src="" />
                    <div className="_text-field">
                      Leave Comment
                    </div>
                  </div>
                  <div className="_comment-footer-bottom">
                    <button>
                      Leave a Comment
                    </button>
                  </div>
                </div>
              </div>
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
