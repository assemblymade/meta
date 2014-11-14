/** @jsx React.DOM */

var Markdown = require('./markdown.js.jsx')
var Icon = require('./icon.js.jsx')
var formatShortTime = require('../lib/format_short_time.js')

module.exports = React.createClass({
  propTypes: {
    bounty: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      bounty: this.props.bounty,
      worker: { username: 'chrislloyd' },
      lockUntil: moment().add(1, 'hour')

    };
  },

  render: function() {
    var bounty = this.props.bounty

    return (
      <div>
        <div className="p3 border-bottom">
          <ul className="list-inline mb2" style={{ 'margin-bottom': '6px' }}>
            {this.props.show_coins ? <li className="text-large">
              {this.renderBountyValuation()}
            </li> : null}
            <li>
              {this.renderUrgency()}
            </li>
            <li>
              {this.renderTagList()}
            </li>
            <li className="text-muted" style={{ 'font-size': '14px', 'color': '#a5a5a5' }}>
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

  renderDescription: function() {
    var bounty = this.state.bounty;

    if (bounty.markdown_description) {
      return <Markdown content={bounty.markdown_description} normalized="true" />;
    } else {
      return <div className="gray">No description yet</div>
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

    if(isStaff) {
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

    if(currentUser) {
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
    var news_item = this.props.news_feed_item;

    if (news_item && window.app.staff()) {
      return (
        <li className="alpha">
          <ToggleButton
            bool={news_item.popular_at !== null}
            text={{ true: 'Depopularize', false: 'Popularize' }}
            classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
            icon={{ true: 'thumbs-down', false: 'fire' }}
            href={{ true: news_item.url + '/depopularize', false: news_item.url + '/popularize' }} />
        </li>
      );
    }
  },

  renderStartWorkButton: function() {
    var currentUser = window.app.currentUser()
    var bounty = this.props.bounty

    if (this.state.closed) {
      return (
        <a className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      )
    }

    if (!this.state.worker) {
      return (
        <button className="btn btn-success mr2" type="button" onClick={this.startWork}>
          Work on this bounty
        </button>
      )
    }

    var worker = this.state.worker

    if (worker.id === currentUser.id) {
      return (
        <div className="clearfix">
          <button className="btn btn-success left mr2" type="button" data-scroll="true" data-target="#event_comment_body">
            Submit work for review
          </button>
          <div className="left h6 mt0 mb0 gray">
            <Icon icon="lock" />
            {' '}
            YHeld for {formatShortTime(this.state.lockUntil)} more
            <br />
            <a href="javascript:void(0)" onClick={this.extendWork(24)}>Extend for a day</a>
            {' '}
            or
            {' '}
            <a href="javascript:void(0)" onClick={this.abandonWork}>abandon</a>
          </div>
        </div>
      );
    }

    return (
      <div className="btn btn-default disabled">
        <span className="mr1"><Icon icon="lock"/></span>
        Held for {formatShortTime(this.state.lockUntil)} by
        {' '}
        <a className="gray" href={worker.url}>@{worker.username}</a>
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
    e.preventDefault()
    var currentUser = window.app.currentUser()
    this.setState({
      worker: currentUser.attributes,
      lockUntil: moment().add(1, 'day').add(1, 'second')
    })
  },

  extendWork: function(hours) {
    return function(e) {
      e.preventDefault()
      // alert('extending by ', hours)
      this.setState({ lockUnti: this.state.lockUntil.add(hours, 'hours') })
    }.bind(this)
  },

  abandonWork: function(e) {
    e.preventDefault()
    // alert('abandoning')
    this.setState({ worker: null, lockUntil: null })
  }
})

window.Bounty = module.exports
