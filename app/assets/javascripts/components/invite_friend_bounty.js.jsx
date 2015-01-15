/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var InviteBountyForm = require('./invite_bounty_form.js.jsx');

(function() {
  var InviteFriendBounty = React.createClass({
    getInitialState: function() {
      return {
        invites: this.props.invites,
        modalShown: false
      }
    },

    render: function() {
      return (
        <div>
          <a href="javascript:void(0);" onClick={this.handleClick}>Recruit help</a>
          {this.renderModal()}
        </div>
      )
    },

    handleClick: function() {
      this.setState({
        modalShown: true
      }, function() {
        this.refs.modal.show()
      }.bind(this));
    },

    handleHide: function() {
      this.setState({
        modalShown: false
      }, function() {
        this.refs.modal.hide()
      }.bind(this));
    },

    renderModal: function() {
      if (this.state.modalShown) {
        return (
          <InviteFriendModal {...this.props}
            onCancel={this.handleHide}
            show={false}
            onSubmit={this.handleFormSubmit}
            ref="modal" />
        );
      }
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
