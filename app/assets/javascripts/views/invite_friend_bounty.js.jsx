/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

var InviteFriendBounty = React.createClass({
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
        <InviteBountyForm url={this.props.url}
                          via_type={this.props.via_type}
                          via_id={this.props.via_id}
                          onSubmit={this.onSubmit.bind(this)}
                          notePlaceholder="Hey! This bounty seems right up your alley">

          <h1>Ask a friend</h1>
          <p>Know somebody who could help with this? Anybody can help out, all you need to do is ask.</p>
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