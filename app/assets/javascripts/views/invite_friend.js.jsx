/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

var InviteFriend = React.createClass({
  getInitialState: function() {
    return { modal: false, invites: this.props.invites };
  },

  render: function() {
    return (
      <div>
        <a className="text-small" href="#help-me" onClick={this.click}>Ask a friend to help with this Bounty</a>
        {this.state.invites.length > 0 ? <InviteList invites={this.state.invites} /> : null}
        {this.state.modal ? this.popover() : null}
      </div>
    )
  },

  popover: function() {
    return (
      <Popover placement="left" positionLeft={-325} positionTop={0}>
        <InviteFriendForm url={this.props.url}
                          via_type={this.props.via_type}
                          via_id={this.props.via_id}
                          onSubmit={this.onSubmit.bind(this)} />
      </Popover>
    )
  },

  click: function() {
    this.setState({modal: !this.state.modal})
  },

  onSubmit: function(invite) {
    this.setState(
      React.addons.update(this.state, {
        invites: {$push: [invite] },
        modal: {$set: false }
      })
    )
  }
})

var InviteList = React.createClass({
  render: function() {
    var inviteNodes = _.map(this.props.invites, function(invite) {
      return <Invite key={invite.id} id={invite.id} invitee_email={invite.invitee_email} invitee={invite.invitee} />
    })
    return (
      <div className="panel panel-default">
        <ul className="list-group list-group-breakout small omega">
          <ReactCSSTransitionGroup transitionName="invite">
            {inviteNodes}
          </ReactCSSTransitionGroup>
        </ul>
      </div>
    )
  },
})

var Invite = React.createClass({
  render: function() {
    return (
      <li className="list-group-item" key={this.props.id}>
      {this.label()}
      </li>
    )
  },

  label: function() {
    if (this.props.invitee) {
      return <span>Invited <a href={this.props.invitee.url}>@{this.props.invitee.username}</a></span>
    } else {
      return <span>Emailed {this.props.invitee_email}</span>
    }

  }
})

var InviteFriendForm = React.createClass({
  getDefaultProps: function() {
    return { model: 'invite' }
  },
  getInitialState: function() {
    return { errors: {} }
  },

  render: function() {
    return (
      <form style={{width:300}} onSubmit={this.handleSubmit}>
        <input type="hidden" name="invite[via_type]" value={this.props.via_type} />
        <input type="hidden" name="invite[via_id]" value={this.props.via_id} />
        <h1>Ask a friend</h1>
        <p>Know somebody who could help with this? Anybody can help out, all you need to do is ask.</p>
        <hr/>
        <FormGroup error={this.state.errors.username_or_email}>
          <label className="control-label">Username or email address</label>
          <input name="invite[username_or_email]" type="text" placeholder="friend@example.com" className="form-control" />
        </FormGroup>
        <FormGroup error={this.state.errors.note}>
          <label>Personal note</label>
          <textarea name="invite[note]" placeholder="Hey! This bounty seems right up your alley" className="form-control" />
        </FormGroup>
        <FormGroup error={this.state.errors.tip_cents}>
          <label>Leave a tip</label>
          <p className="text-muted">Get the started on the right foot. Generosity always pays off</p>

          <div className="btn-group text-center" data-toggle="buttons" style={{width:'100%'}}>
            <label className="btn btn-primary active" style={{width:'34%'}}>
              <input type="radio" name="invite[tip_cents]" value="1000" defaultChecked={true} /> <span className="icon icon-app-coin">10</span>
            </label>
            <label className="btn btn-primary" style={{width:'33%'}}>
              <input type="radio" name="invite[tip_cents]" value="10000"/> <span className="icon icon-app-coin">100</span>
            </label>
            <label className="btn btn-primary" style={{width:'33%'}}>
              <input type="radio" name="invite[tip_cents]" value="50000"/> <span className="icon icon-app-coin">500</span>
            </label>
          </div>
        </FormGroup>
        <hr/>
        <button className="btn btn-primary btn-block" style={{"margin-bottom":20}}>Send message</button>
      </form>
    )
  },

  handleSubmit: function(e) {
    e.preventDefault()
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: $(e.target).serialize(),
      success: function(data) {
        this.props.onSubmit(data)
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseJSON && xhr.responseJSON.errors) {
          this.handleErrors(xhr.responseJSON.errors)
        }
      }.bind(this)
    });
  },

  handleErrors: function(errors) {
    this.setState({errors: errors})
  }
})

var InviteSent = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Sent!</h1>
      </div>
    )
  }
})