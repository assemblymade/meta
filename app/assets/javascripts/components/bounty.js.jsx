/** @jsx React.DOM */

(function() {
  var Bounty = React.createClass({
    getDefaultProps: function() {
      return {
        currentUser: app.currentUser(),
        bounty: null
      };
    },

    getInitialState: function() {
      return {
        bounty: this.props.bounty
      };
    },

    renderBountyValuation: function() {
      var bounty = this.state.bounty;
      var maxOffer = Math.round(6 * bounty.product.average_bounty / 10000) * 10000

      return (
        <BountyValuation
          offersPath={bounty.offers_url}
          product={bounty.product}
          contracts={bounty.contracts}
          offers={bounty.offers}
          maxOffer={maxOffer}
          averageBounty={bounty.product.average_bounty}
          value={bounty.value}
          open={bounty.open} />
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

    renderDescription: function() {
      var bounty = this.state.bounty;

      if(bounty.markdown_description) {
        return <div className="markdown markdown-content text-large" dangerouslySetInnerHTML={{__html: bounty.markdown_description}}></div>;
      } else {
        return <p className="large text-muted">(No description)</p>;
      }
    },

    renderWorkers: function() {
      var bounty = this.state.bounty;
      if(!bounty.can_update) { return }

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
    },

    renderFlagButton: function() {
      var bounty = this.state.bounty;
      var isStaff = this.props.currentUser && this.props.currentUser.get('staff');

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

    renderEditButton: function() {
      var bounty = this.state.bounty;

      if(bounty.can_update) {
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

    renderOpenButton: function() {
      var bounty = this.state.bounty;

      if(bounty.can_update) {
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

    renderFollowButton: function() {
      var bounty = this.state.bounty;

      if(this.props.currentUser) {
        return (
          <li>
            <ToggleButton
              bool={bounty.following}
              text={{ true: 'Mute', false: 'Follow' }}
              icon={{ true: 'volume-off', false: 'volume-2' }}
              classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
              href={{ true: bounty.mute_url, false: bounty.watch_url }} />
          </li>
        );
      }
    },

    renderInviteFriendButton: function() {
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

    renderStartWorkButton: function() {
      var bounty = this.state.bounty;
      var closed = bounty.state == 'resolved' || bounty.state == 'closed'

      if(closed) {
        return;
      }

      var currentUserId = this.props.currentUser && this.props.currentUser.get('id');
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

        $.ajax({
          url: bounty.start_work_url,
          dataType: 'json',
          type: 'PATCH',
          success: function() {
            bounty.workers = bounty.workers.concat(this.props.currentUser.attributes);
            this.setState({ bounty: bounty });
          }.bind(this),
          error: function() {
            window.location = '/login?alert=true';
          }
        });
      }.bind(this);

      if(isWorking) {
        return (
          <li>
            <a href="#" onClick={stopWork} className="btn btn-label red">
              Abandon bounty
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
      var bounty = this.state.bounty;
      var closed = bounty.state == 'resolved' || bounty.state == 'closed'

      if(closed) {
        return;
      }

      var currentUserId = this.props.currentUser && this.props.currentUser.get('id');
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

    renderClosedNotice: function() {
      var bounty = this.state.bounty;
      var closed = bounty.state == 'resolved' || bounty.state == 'closed'

      if(!closed) {
        return
      }

      return (
        <li className="omega">
          <a href="#" className="btn btn-default disabled">
            {bounty.state == 'resolved' ? 'Completed & Closed' : 'Closed'}
          </a>
        </li>
      )
    },

    renderDiscussWorkBanner: function() {
      var bounty = this.state.bounty;
      var closed = bounty.state == 'resolved' || bounty.state == 'closed'

      if(closed) {
        return;
      }

      var currentUserId = this.props.currentUser && this.props.currentUser.get('id');
      var mostRecentWorkerId = bounty.most_recent_other_wip_worker && bounty.most_recent_other_wip_worker.user_id;

      var working = _.any(bounty.workers, function(worker) { return worker.id == currentUserId });
      var otherWorker = _.find(bounty.workers, function(worker) { return worker.id == mostRecentWorkerId });

      if(!working || !otherWorker) { return; }

      var otherWorkersCount = bounty.workers.length - 1;
      var workersPhrase = otherWorkersCount == 1 ? '1 other person' : otherWorkersCount + ' other people';

      var message = "Hey @" + otherWorker.username + ". Mind if I help out with #" + bounty.number + "?";
      var discussUrl = bounty.chat_room_url + '?message=' + encodeURIComponent(message);

      return (
        <div style={{ 'padding': '15px', 'background-color': '#EBF8CA', 'border': '1px solid #E6F3C6', 'border-radius': '3px', 'font-size': '16px', 'line-height': '38px', 'margin-bottom': '30px' }}>
          <a href={discussUrl} className="btn btn-default pull-right">
            <span className="icon icon-bubble icon-left"></span>
            Discuss the work
          </a>

          <p className="omega gray-light" style={{ 'margin-left': '6px' }}>
            <strong className="black">Right on!</strong>
            {' '}
            {workersPhrase} started working on this bounty {moment(bounty.most_recent_other_wip_worker.created_at).fromNow()}.
          </p>
        </div>
      );
    },

    render: function() {
      var bounty = this.state.bounty;

      return (
        <div>
          <div className="card">
            <div className="card-heading">
              <ul className="list-inline" style={{ 'margin-bottom': '6px' }}>
                <li className="text-large">
                  {this.renderBountyValuation()}
                </li>
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

              <h1 className="alpha omega">
                {this.state.bounty.title}
                {' '}
                <small style={{ 'font-size': '30px', 'color': '#b4b4b4' }}>
                  #{this.state.bounty.number}
                </small>
              </h1>
            </div>

            <div className="card-body bounty-description">
              {this.renderDescription()}
              {this.renderWorkers()}
            </div>

            <div className="card-footer clearfix">
              <ul className="list-inline alpha omega pull-left">
                {this.renderFlagButton()}
                {this.renderEditButton()}
                {this.renderOpenButton()}
                {this.renderFollowButton()}
              </ul>

              <ul className="list-inline alpha omega pull-right">
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
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Bounty;
  }

  window.Bounty = Bounty;
})();
