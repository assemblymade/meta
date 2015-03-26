(function() {
  var CustomBountyOffer = React.createClass({
    getInitialState: function() {
      var value = this.props.steps[2]

      if(this.props.onChange) {
        this.props.onChange({ target: { value: value }})
      }

      return {
        value: value
      }
    },

    renderOwnership: function() {
      var value = this.state.value
      var ownership = value / (value + this.props.coinsMinted) * 100;

      if(ownership < 0.001) {
        return "< 0.001%"
      } else if(ownership < 1) {
        var roundedOwnership = Math.floor(ownership * 1000) / 1000
        return roundedOwnership + "%"
      } else if(ownership < 10) {
        var roundedOwnership = Math.floor(ownership * 100) / 100
        return roundedOwnership + "%"
      } else {
        var roundedOwnership = Math.floor(ownership)
        return roundedOwnership + "%"
      }
    },

    renderSellingPrice: function() {
      var value = this.state.value
      var ownership = value / (value + this.props.coinsMinted);

      var sellingPrice = Math.round(ownership * 1000000);

      return "$" + sellingPrice
    },

    renderPayout: function() {
      var value = this.state.value
      var ownership = value / (value + this.props.coinsMinted);

      var profitLastMonth = Math.round(this.props.profitLastMonth / 100)
      var payout = Math.round(ownership * (profitLastMonth || 20000));

      return "$" + payout
    },

    renderProfitLastMonth: function() {
      var profitLastMonth = Math.round(this.props.profitLastMonth / 100)

      if(profitLastMonth) {
        return "each month out <br /> of $" + profitLastMonth + "/mo"
      } else {
        return "each month if you <br /> made $20,000/mo"
      }
    },

    renderAverage: function() {
      var average = this.state.value / this.props.averageBounty

      if(average < 0.001) {
        return "< 0.001x"
      } else if(average < 1) {
        var roundedAverage = Math.floor(average * 1000) / 1000
        return roundedAverage + 'x'
      } else if(average < 10) {
        var roundedAverage = Math.floor(average * 100) / 100
        return roundedAverage + 'x'
      } else {
        var roundedAverage = Math.floor(average)
        return roundedAverage + 'x'
      }
    },

    renderStats: function() {
      if(this.props.profitLastMonth) {
        return(
          <div className="stat-group mb0">
            <div className="stat">
              <div className="stat-value">
                {this.renderOwnership()}
              </div>
              <div className="stat-title ml2 mr2">
                ownership<br />
                in {this.props.product.name}
              </div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {this.renderPayout()}
              </div>
              <div className="stat-title ml2 mr2" dangerouslySetInnerHTML={{ __html: this.renderProfitLastMonth() }} />
            </div>
            <div className="stat">
              <div className="stat-value">
                {this.renderSellingPrice()}
              </div>
              <div className="stat-title ml2 mr2">
                if {this.props.product.name} was <br /> sold for $1 million
              </div>
            </div>
          </div>
        )
      } else {
        return(
          <div className="stat-group mb0">
            <div className="stat">
              <div className="stat-value">
                {this.renderOwnership()}
              </div>
              <div className="stat-title ml2 mr2">
                ownership in {this.props.product.name}
              </div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {this.renderAverage()}
              </div>
              <div className="stat-title ml2 mr2">
                the average {this.props.product.name} bounty
              </div>
            </div>
          </div>
        )
      }
    },

    render: function() {
      return (
        <div>
          <div>
            <div style={{ position: 'relative' }}>
              <span className="icon icon-app-coin yellow" style={{ position: 'absolute', top: '12px', left: '8px' }}></span>
              <input name="earnable" type="text" defaultValue={this.state.value} onChange={this.handleOfferChange} className="form-control yellow bold input-lg" style={{ 'padding-left': '30px' }} />
            </div>
          </div>
          <div className="mt2">
            {this.renderStats()}
          </div>
        </div>
      )
    },

    handleOfferChange: function(e) {
      this.setState({
        value: parseInt(e.target.value.replace(/[^\d]/g, '')) || 0
      })

      if(this.props.onChange) {
        this.props.onChange(e);
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = CustomBountyOffer;
  }

  window.CustomBountyOffer = CustomBountyOffer;
})();
