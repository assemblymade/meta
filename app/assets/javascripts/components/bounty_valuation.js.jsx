

(function() {
  var AppCoins = require('./app_coins.js.jsx')
  var BountyBreakdown = require('./bounty_breakdown.js.jsx');
  var Icon = require('./ui/icon.js.jsx')

  var BountyValuation = React.createClass({
    propTypes: {
      contracts: React.PropTypes.object.isRequired,
      product: React.PropTypes.object.isRequired,
      url: React.PropTypes.string,
      maxOffer: React.PropTypes.number,
      averageBounty: React.PropTypes.number,
      coinsMinted: React.PropTypes.number,
      profitLastMonth: React.PropTypes.number,
      steps: React.PropTypes.array
    },

    getInitialState: function() {
      return {
        shown: false,
      }
    },

    renderLightbox: function() {
      if (this.state.shown) {
        return <BountyBreakdown {...this.props} onHidden={this.handleHide} />
      }
    },

    render: function() {
      var chevron
      var toggle

      if (this.props.allowEditing) {
        chevron = (
          <div className="left yellow ml1">
            <Icon icon="chevron-down" />
          </div>
        )

        toggle = this.toggle
      }

      return (
        <div className="clearfix">
          <a className="block left clearfix" href="#" id="bounty-amount-link" onClick={toggle}>
            <div className="left">
              <AppCoins n={this.props.earnable_coins_cache} />
            </div>
            {chevron}
          </a>

          <a className="block right ml2 gray-4 gray-2-hover" href="/help/revenue">
            <Icon icon="question-circle" />
          </a>

          {this.renderLightbox()}
        </div>
      )
    },

    toggle: function(event) {
      this.setState({
        shown: !this.state.shown
      });

      event.stopPropagation();
      event.preventDefault();
    },

    handleHide: function() {
      this.setState({
        shown: false
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyValuation;
  }

  window.BountyValuation = BountyValuation;
})();
