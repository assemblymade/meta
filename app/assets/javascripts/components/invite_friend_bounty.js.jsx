/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Popover = require('./popover.js.jsx');
var InviteBountyForm = require('./invite_bounty_form.js.jsx');

(function() {
  var InviteFriendBounty = React.createClass({
    getInitialState: function() {
      return {
        popoverShown: false,
        invites: this.props.invites
      }
    },

    render: function() {
      return (
        <BsPopover
          content={InviteBountyForm({
            url: this.props.url,
            via_type: this.props.via_type,
            via_id: this.props.via_id,
            onSubmit: this.onSubmit,
            notePlaceholder: "Hey! This bounty seems right up your alley"})}
          placement="bottom"
          visible={this.state.popoverShown}
          onHide={this.handleHide}>
            <a href="javascript:;" onClick={this.togglePopover}>recruit help</a>
        </BsPopover>
      )
    },

    onSubmit: function(invite) {
      // this.setState(
      //   React.addons.update(this.state, {
      //     invites: {$push: [invite] },
      //     modal: {$set: false }
      //   })
      // )
    },

    togglePopover: function() {
      this.setState({popoverShown: !this.state.popoverShown })
      return false
    },

    handleHide: function() {
      this.setState({popoverShown: false})
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteFriendBounty;
  }

  window.InviteFriendBounty = InviteFriendBounty;
})();
