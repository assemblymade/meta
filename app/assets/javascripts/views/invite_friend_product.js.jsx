/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

var InviteFriendProduct = React.createClass({
  getInitialState: function() {
    return { modal: false, invites: this.props.invites };
  },

  render: function() {
    return (
      <div>
        <button className="btn btn-default btn-sm btn-block" style={{"margin-bottom":16}} onClick={this.click}>Invite a friend</button>
        {this.state.invites.length > 0 ? <InviteList invites={this.state.invites} /> : null}
        {this.state.modal ? this.popover() : null}
      </div>
    )
  },

  popover: function() {
    return (
      <Popover placement="left" positionLeft={-325} positionTop={-129}>
        <InviteBountyForm url={this.props.url}
                          via_type={this.props.via_type}
                          via_id={this.props.via_id}
                          onSubmit={this.onSubmit.bind(this)}
                          notePlaceholder={this.props.notePlaceholder}>

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
