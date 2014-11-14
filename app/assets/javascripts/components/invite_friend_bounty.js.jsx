/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Popover = require('./popover.js.jsx');
var InviteBountyForm = require('./invite_bounty_form.js.jsx');

(function() {
  var InviteFriendBounty = React.createClass({
    getInitialState: function() {
      return {
        invites: this.props.invites
      }
    },

    render: function() {
      return (
        <div>
          <a href="javascript:void(0);" onClick={this.handleClick} className="btn btn-label">Recruit help</a>
          <InviteFriendModal {...this.props}
            onCancel={this.handleHide}
            show={false}
            onSubmit={this.handleFormSubmit}
            ref="modal" />
        </div>
      )
    },

    handleFormSubmit: function(invite) {
      // window.location.reload()
      // this.setState(
      //   React.addons.update(this.state, {
      //     invites: {$push: [invite] },
      //     modal: {$set: false }
      //   })
      // )
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

  if (typeof module !== 'undefined') {
    module.exports = InviteFriendBounty;
  }

  window.InviteFriendBounty = InviteFriendBounty;
})();
