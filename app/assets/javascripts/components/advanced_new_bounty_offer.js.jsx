(function() {
  var AdvancedNewBountyOffer = React.createClass({
    getInitialState: function() {
      return {
        value: this.props.steps[2]
      }
    },

    renderOwnership: function() {
      var value = this.state.value
      var ownership = value / (value + this.props.coinsMinted) * 100;
      var roundedOwnership = Math.floor(ownership * 1000) / 1000

      if(roundedOwnership < 0.001) {
        return "< 0.001%"
      } else {
        return roundedOwnership + "%"
      }
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
        return "of profits each month<br /> (out of $" + profitLastMonth + "/mo)"
      } else {
        return "of profits each month<br /> (if you made $20,000/mo)"
      }
    },

    render: function() {
      return (
        <div className="py3">
          <div className="row">
            <div className="col-xs-12">
              <div style={{ position: 'relative' }}>
                <span className="icon icon-app-coin text-coins" style={{ position: 'absolute', top: '12px', left: '8px' }}></span>
                <input name="offer" type="text" defaultValue={this.state.value} onChange={this.handleOfferChange} className="form-control text-coins bold input-lg" style={{ 'padding-left': '30px' }} />
              </div>
            </div>
          </div>
          <div className="row mt2">
            <div className="stat-group">
              <div className="stat">
                <div className="stat-value">
                  {this.renderOwnership()}
                </div>
                <div className="stat-title">
                  onwership<br />
                  in {this.props.product.name}
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {this.renderOwnership()}
                </div>
                <div className="stat-title">
                  of unvested<br /> {this.props.product.name} coins
                </div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {this.renderPayout()}
                </div>
                <div className="stat-title" dangerouslySetInnerHTML={{ __html: this.renderProfitLastMonth() }} />
              </div>
            </div>
          </div>
        </div>
      )
    },

    handleOfferChange: function(e) {
      this.setState({
        value: parseInt(e.target.value)
      })
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = AdvancedNewBountyOffer;
  }

  window.AdvancedNewBountyOffer = AdvancedNewBountyOffer;
})();
