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
        newOffer: this.props.averageBounty
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

        <span className="text-coins">
          <span className="icon icon-app-coin"></span>
          {numeral(this.state.newOffer).format('0,0')}
        </span>
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
