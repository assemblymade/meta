/** @jsx React.DOM */
var Spinner = require('react-spinner');

(function() {
  var BountyBreakdown = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getDefaultProps: function() {
      return {
        user: app.currentUser()
      }
    },
    getInitialState: function() {
      return {
        offers: this.props.offers,
        newOffer: this.props.averageBounty
      }
    },
    render: function() {
      return <div className="popover-content" style={{"min-width": 300}}>
        <h5>Breakdown</h5>
        {BountyContracts({contracts: this.props.contracts, product: this.props.product})}

        <h5>Bounty Valuation</h5>
        {BountyOffers({offers: this.state.offers, product: this.props.product})}

        {this.updateOffer()}
      </div>
    },

    updateOffer: function() {
      if (!this.props.user) {
        return <div />
      }

      return <div>
        <h5>What is this worth?</h5>

        <form className="form" id="test">
          <div className="clearfix text-muted small">
            <span className="pull-left">Simple</span>
            <span className="pull-right">Complex</span>
          </div>
          <input type="range" min="0" max={this.props.maxOffer} valueLink={this.linkState('newOffer')} />
          <br />
          <p>
            <span className="text-success">
              {this.relativeSize()}
            </span>
            <span> the average {this.props.product.name} bounty.</span>
          </p>

          <a id="slider" className="btn btn-default btn-block btn-xs" href="#" onClick={this.handleOfferClicked}>
            Offer {numeral(this.state.newOffer).format('0,0')} coins
          </a>
        </form>
      </div>
    },

    handleOfferClicked: function() {
      window.xhr.post(
        this.props.offersPath,
        { amount: this.state.newOffer },
        function(data) {
          window.location.reload()
        }
      )
    },

    relativeSize: function() {
      var factor = this.state.newOffer / this.props.averageBounty
      if (factor <= 0.9) {
        return numeral(factor).format('0%') + ' less than'
      } else if (factor > 1.1) {
        return numeral(factor).format('0%') + ' more than'
      } else {
        return 'Similar size to'
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyBreakdown;
  }

  window.BountyBreakdown = BountyBreakdown;
})();
