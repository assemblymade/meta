/** @jsx React.DOM */

(function() {
  var InitialOffer = React.createClass({
    getDefaultProps: function() {
      return {
        user: app.currentUser()
      }
    },
    getInitialState: function() {
      return {
        newOffer: this.props.averageBounty * 0.10
      }
    },
    render: function() {
      return <div>
        <NewBountyOffer
          product={this.props.product}
          user={this.props.user}
          maxOffer={this.props.maxOffer}
          newOffer={this.state.newOffer}
          averageBounty={this.props.averageBounty}
          onChange={this.handleOfferChanged} />

        <input name="offer" type="hidden" value={this.state.newOffer} />
      </div>
    },

    handleOfferChanged: function(newOffer) {
      this.setState({newOffer: newOffer})
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InitialOffer;
  }

  window.InitialOffer = InitialOffer;
})();
