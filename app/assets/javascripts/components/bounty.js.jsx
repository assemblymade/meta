/** @jsx React.DOM */

var Markdown = require('./markdown.js.jsx')
var Icon = require('./icon.js.jsx')
var formatShortTime = require('../lib/format_short_time.js')

module.exports = React.createClass({
  propTypes: {
    bounty: React.PropTypes.object.isRequired,
    item: React.PropTypes.object,
    noInvites: React.PropTypes.bool,
    showCoins: React.PropTypes.bool
  },

  abandonWork: function(e) {
    e.preventDefault();

    var user = window.app.currentUser();

    window.analytics.track('bounty.extended', {
      user: user,
      product: window.app.currentAnalyticsProduct()
    });

    this.setState({
      worker: null,
      lockUntil: null
    }, function() {
      $.ajax({
        url: this.props.bounty.stop_work_url,
        method: 'PATCH',
        headers: {
          'accept': 'application/json'
        },
        success: function(data) {},
        error: function(jqXhr, status, error) {
          console.error(error);
        }
      });
    });
  },

  extendWork: function(hours) {
    return function(e) {
      e.preventDefault();

      var user = window.app.currentUser();

      window.analytics.track('bounty.extended', {
        user: user,
        product: window.app.currentAnalyticsProduct()
      });

      this.setState({
        lockUntil: this.state.lockUntil.add(hours, 'hours')
      }, function() {
        console.log(this.props.bounty.lock_url)
        $.ajax({
          url: this.props.bounty.lock_url,
          method: 'PATCH',
          headers: {
            'accept': 'application/json'
          },
          success: function(data) {},
          error: function(jqXhr, status, error) {
            console.error(error);
          }
        });
      }.bind(this));
    }.bind(this)
  },

  getInitialState: function() {
    var bounty = this.props.bounty;

    return {
      // :<
      bounty: this.props.bounty,
      worker: this.props.bounty.workers[0],
      lockUntil: moment(bounty.locked_at).add(60, 'hours')
    };
  },

  render: function() {
    var bounty = this.state.bounty;

    return (
      <div>
        <div className="p3 border-bottom">
          <ul className="list-inline mb2" style={{ marginBottom: '6px' }}>
            {this.props.showCoins ? <li className="text-large">
              {this.renderBountyValuation()}
            </li> : null}
            <li>
              {this.renderUrgency()}
            </li>
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

          <h1 className="mt0 mb0">
            {this.state.bounty.title}
            {' '}
            <small className="gray" style={{ fontSize: '85%' }}>
              #{bounty.number}
            </small>
          </h1>
        </div>

        <div className="p3">
          {this.renderDescription()}
        </div>

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
      </div>
    );
  },

  renderBountyValuation: function() {
    return BountyValuation(_.extend(this.state.bounty, this.props.valuation))
  },

  renderClosedNotice: function() {
    var bounty = this.state.bounty;
    var closed = bounty.state == 'resolved' || bounty.state == 'closed'

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
    } else {
      return <div className="gray">No description yet</div>
    }
  },

  /**
   * This function is never used :(
   */

  renderDiscussWorkBanner: function() {
    var bounty = this.state.bounty;
    var closed = bounty.state === 'resolved' || bounty.state === 'closed';
    var currentUser = window.app.currentUser();

    if (closed) {
      return;
    }

    var currentUserId = currentUser && currentUser.get('id');
    var mostRecentWorkerId = bounty.most_recent_other_wip_worker && bounty.most_recent_other_wip_worker.user_id;
    var working = _.any(bounty.workers, function(worker) { return worker.id == currentUserId });
    var otherWorker = _.find(bounty.workers, function(worker) { return worker.id == mostRecentWorkerId });

    if (!working || !otherWorker) {
      return;
    }

    var otherWorkersCount = bounty.workers.length - 1;
    var workersPhrase = otherWorkersCount == 1 ? '1 other person' : otherWorkersCount + ' other people';
    var message = "Hey @" + otherWorker.username + ". Mind if I help out with #" + bounty.number + "?";
    var discussUrl = bounty.chat_room_url + '?message=' + encodeURIComponent(message);

    return (
      <div style={{
          'padding': '15px',
          backgroundColor: '#EBF8CA',
          'border': '1px solid #E6F3C6',
          borderRadius: '3px',
          fontSize: '16px',
          lineHeight: '38px',
          marginBottom: '30px'
      }}>
        <a href={discussUrl} className="btn btn-default pull-right">
          <span className="icon icon-bubble icon-left"></span>
          Discuss the work
        </a>

        <p className="omega gray-darker" style={{ marginLeft: '6px' }}>
          <strong className="black">Right on!</strong>
          {' '}
          {workersPhrase} started working on this bounty {moment(bounty.most_recent_other_wip_worker.created_at).fromNow()}.
        </p>
      </div>
    );
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
            bool={bounty.following}
            text={{ true: 'Unsubscribe', false: 'Subscribe' }}
            icon={{ true: '', false: '' }}
            classes={{ true: '', false: '' }}
            href={{ true: bounty.mute_url, false: bounty.follow_url }} />
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

    if(!closed) {
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

  renderOpenButton: function() {
    var bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li>
          <ToggleButton
            bool={bounty.open}
            text={{ true: 'Close', false: 'Reopen' }}
            icon={{ true: '', false: '' }}
            classes={{ true: '', false: '' }}
            href={{ true: bounty.close_url, false: bounty.reopen_url }} />
        </li>
      )
    }
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
    var bounty = this.props.bounty;

    if (this.state.closed) {
      return (
        <a className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      );
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
          <a className="btn btn-default left mr2" style={{ color: '#5CB85C !important', border: '1px solid #d3d3d3' }} type="button" data-scroll="true" data-target="#event_comment_body">
            <span className="icon icon-document icon-left"></span>
            Submit work for review
          </a>
          <div className="left h6 mt0 mb0 gray">
            <Icon icon="lock" />
            {' '}
            Held for {formatShortTime(this.state.lockUntil)} more
            <br />
            <a href="javascript:void(0)" onClick={this.extendWork(60)}>Extend for 2.5 days</a>
            {' '}
            or
            {' '}
            <a href="javascript:void(0)" onClick={this.abandonWork}>abandon</a>
          </div>
        </div>
      );
    }

    return (
      <div className="py1 gray">
        <span className="mr1"><Icon icon="lock" /></span>
        {' '}
        <a className="gray" href={worker.url}>
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
        filterUrl={bounty.product.wips_url}
        destination={true}
        tags={tags}
        newBounty={true}
        url={bounty.tag_url} />
    );
  },

  renderUrgency: function() {
    var bounty = this.state.bounty;
    var urgencies = ['Urgent', 'Now', 'Someday'];

    return (
      <Urgency
        initialLabel={bounty.urgency.label}
        urgencies={urgencies}
        state={bounty.state}
        url={bounty.urgency_url} />
    );
  },

  startWork: function(e) {
    e.preventDefault();

    var currentUser = window.app.currentUser();
    var bounty = this.props.bounty;

    this.setState({
      worker: currentUser.attributes,
      lockUntil: moment().add(60, 'hours').add(1, 'second')
    }, function() {
      $.ajax({
        url: this.props.bounty.start_work_url,
        method: 'PATCH',
        headers: {
          'accept': 'application/json'
        },
        success: function(data) {},
        error: function(jqXhr, status, error) {
          console.error(error);
        }
      });
    });
  }
})

window.Bounty = module.exports
