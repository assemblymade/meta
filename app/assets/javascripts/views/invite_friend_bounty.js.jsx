/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

var InviteFriendBounty = React.createClass({
  getInitialState: function() {
    return { modal: false, invites: this.props.invites };
  },

  render: function() {
    return (
      <div>
        <a className="btn btn-default btn-block btn-sm" href="#help-me" onClick={this.click}>Invite a friend to help</a>
        {this.state.invites.length > 0 ? <InviteList invites={this.state.invites} /> : null}
        {this.state.modal ? this.popover() : null}
      </div>
    )
  },

  popover: function() {
    return (
      <Popover placement="left" positionLeft={-325} positionTop={-120}>
        <InviteBountyForm url={this.props.url}
                          via_type={this.props.via_type}
                          via_id={this.props.via_id}
                          onSubmit={this.onSubmit.bind(this)}
                          notePlaceholder="Hey! This bounty seems right up your alley">

          <h2 className="alpha">Ask a friend</h2>
          <p className="text-muted">Know somebody who could help with this? Anybody can help out, all you need to do is ask.</p>
        </InviteBountyForm>
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
