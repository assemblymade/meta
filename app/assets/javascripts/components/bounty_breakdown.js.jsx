/** @jsx React.DOM */

(function() {
  var BountyBreakdown = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    getDefaultProps: function() {
      return {
        user: app.currentUser()
      };
    },

    getInitialState: function() {
      return {
        offers: this.props.offers,
        newOffer: this.props.averageBounty * 0.10,
        saving: false
      };
    },

    render: function() {
      return <div className="popover-content" style={{"min-width": 360}}>
        <h5>Breakdown</h5>
        {BountyContracts({contracts: this.props.contracts, product: this.props.product})}

        <h5>Bounty Valuations</h5>
        {BountyOffers({offers: this.state.offers, product: this.props.product})}

        {(this.props.open && this.props.user) ? this.newOffer() : null}
      </div>
    },

    newOffer: function() {
      return <div>

        <h5>How many coins do you think this is worth?</h5>

        <form className="form">
          <NewBountyOffer
            product={this.props.product}
            user={this.props.user}
            maxOffer={this.props.maxOffer}
            newOffer={this.state.newOffer}
            averageBounty={this.props.averageBounty}
            onChange={this.handleOfferChanged} />

          {this.offerButton()}
        </form>
      </div>
    },

    handleOfferChanged: function(newOffer) {
      this.setState({newOffer: newOffer})
    },

    handleOfferClicked: function() {
      this.setState({saving: true})

      window.xhr.post(
        this.props.offersPath,
        { amount: this.state.newOffer },
        function(data) {
          window.location.reload()
        }
      )
      return false
    },

    offerButton: function() {
      if (this.state.saving) {
        return <a className="btn btn-default btn-block btn-xs" style={{"margin-top": "20px"}} disabled>
          Saving...
          <div className="pull-right spinner"><div className="spinner-icon"></div></div>
        </a>
      } else {
        return <a id="slider" className="btn btn-default btn-block btn-xs" style={{"margin-top": "20px"}} href="#" onClick={this.handleOfferClicked}>
          Value this at {numeral(this.state.newOffer).format('0,0')} {this.props.product.name} Coins
        </a>
      }

    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyBreakdown;
  }

  window.BountyBreakdown = BountyBreakdown;
})();
