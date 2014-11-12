/** @jsx React.DOM */

var Markdown = require('./markdown.js.jsx')

module.exports = React.createClass({
  propTypes: {
    bounty: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      bounty: this.props.bounty
    };
  },

  render: function() {
    var bounty = this.props.bounty

    return (
      <div>
        <div className="card">
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
            {this.renderWorkers()}
          </div>

          <div className="card-footer px3 py2 clearfix">
            <ul className="list-inline mt0 mb0 left">
              {this.renderFlagButton()}
              {this.renderPopularizeButton()}
              {this.renderEditButton()}
              {this.renderOpenButton()}
              {this.renderFollowButton()}
            </ul>

            <ul className="list-inline mt0 mb0 right">
              {this.renderInviteFriendButton()}
              {this.renderStartWorkButton()}
              {this.renderSubmitWorkButton()}
              {this.renderClosedNotice()}
            </ul>
          </div>
        </div>
        {this.renderDiscussWorkBanner()}
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

    if (!working || !otherWorker) { return; }

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

  renderDescription: function() {
    var bounty = this.state.bounty;

    if (bounty.markdown_description) {
      return <div className="markdown markdown-content text-large"
          dangerouslySetInnerHTML={{__html: bounty.markdown_description}} />;
    } else {
      return <p className="large text-muted">(No description)</p>;
    }
  },

  renderEditButton: function() {
    var bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li>
          <a href={bounty.edit_url} className="btn btn-label">
            <span className="icon icon-pencil icon-left"></span>
            Edit
          </a>
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
            classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
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
            icon={{ true: 'volume-off', false: 'volume-2' }}
            classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
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
            icon={{ true: 'close', false: 'check' }}
            classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
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
    var currentUser = window.app.currentUser();
    var bounty = this.state.bounty;
    var closed = bounty.state == 'resolved' || bounty.state == 'closed'

    if(closed) {
      return;
    }

    var currentUserId = currentUser && currentUser.get('id');
    var isWorking = !!_.find(bounty.workers, function(worker) { return worker.id == currentUserId });

    var stopWork = function(event) {
      event.stopPropagation();
      event.preventDefault();

      $.ajax({
        url: bounty.stop_work_url,
        dataType: 'json',
        type: 'PATCH',
        success: function() {
          bounty.workers = _.reject(bounty.workers, function(worker) { return worker.id == currentUserId });
          this.setState({ bounty: bounty });
        }.bind(this)
      });
    }.bind(this);

    var startWork = function(event) {
      event.stopPropagation();
      event.preventDefault();

      var currentUser = window.app.currentUser();

      $.ajax({
        url: bounty.start_work_url,
        dataType: 'json',
        type: 'PATCH',
        success: function() {
          bounty.workers = bounty.workers.concat(currentUser.attributes);
          this.setState({ bounty: bounty });
        }.bind(this),
        error: function() {
          window.location = '/login?alert=true';
        }
      });
    }.bind(this);

    if (isWorking) {
      return (
        <li>
          <a href="#" onClick={stopWork} className="btn btn-label red">
            Abandon
          </a>
        </li>
      );
    } else {
      return (
        <li className="omega">
          <a href="#" onClick={startWork} className="btn btn-success">
            Work on this bounty
          </a>
        </li>
      )
    }
  },

  renderSubmitWorkButton: function() {
    var currentUser = window.app.currentUser();
    var bounty = this.state.bounty;
    var closed = bounty.state == 'resolved' || bounty.state == 'closed'

    if(closed) {
      return;
    }

    var currentUserId = currentUser && currentUser.get('id');
    var isWorking = !!_.find(bounty.workers, function(worker) { return worker.id == currentUserId });

    if(isWorking) {
      return (
        <li className="omega">
          <a href="#" className="btn btn-default" style={{ 'color': '#5cb85c !important' }} data-scroll="true" data-target="#event_comment_body">
            <span className="icon icon-document icon-left"></span>
            Submit work for review
          </a>
        </li>
      );
    }
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

  renderWorkers: function() {
    var bounty = this.state.bounty;
    if(!bounty.can_update || !bounty.workers.length) { return }

    var workers = bounty.workers.map(function(worker) {
      return <a href={worker.url}>{worker.username}</a>
    })

    var commasLength = workers.length - 2
    var conjunction = workers.length > 1 ? [' and '] : []

    var breaks = [];
    for(i = 0; i < commasLength; i++) { breaks.push(', '); }
    breaks.push(conjunction)

    var sentence = _.flatten(_.zip(workers, breaks))

    var mostRecentWorker = _.max(_.map(bounty.wip_workers, function(w) { return w.created_at }))

    return (
      <div>
        <br />

        <p className="text-muted omega">
          {sentence}
          {' '}
          started working on this bounty

          <time className="timestamp" dateTime={mostRecentWorker}></time>.
        </p>
      </div>
    )
  }
})

window.Bounty = module.exports
