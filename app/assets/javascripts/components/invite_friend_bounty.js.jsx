

var InviteBountyForm = require('./invite_bounty_form.js.jsx');
var Lightbox = require('./lightbox.js.jsx');
var BsModalMixin = require('../mixins/bs_modal_mixin.js.jsx')

var InviteFriendBounty = React.createClass({
  getInitialState: function() {
    return {
      invites: this.props.invites
    }
  },

  render: function() {
    return (
      <div>
        <a href="javascript:void(0);" onClick={this.handleClick}>Recruit help</a>
        <InviteFriendModal {...this.props}
          onCancel={this.handleHide}
          show={false}
          onSubmit={this.handleFormSubmit}
          ref="modal" />
      </div>
    )
  },

  handleFormSubmit: function(invite) {
  },

  handleClick: function() {
    this.refs.modal.show()
  },

  handleHide: function() {
    this.refs.modal.hide()
  }
});


var InviteFriendModal = React.createClass({
  mixins: [BsModalMixin],

  render: function() {
    return (
      <Lightbox>
        <InviteBountyForm show={false}
                          url={this.props.url}
                          via_type={this.props.via_type}
                          via_id={this.props.via_id}
                          onSubmit={this.props.onSubmit}
                          notePlaceholder="Hey! This bounty seems right up your alley" />
      </Lightbox>
    )
  }
})

module.exports = window.InviteFriendBounty = InviteFriendBounty;
