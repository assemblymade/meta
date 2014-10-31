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
        value: this.props.averageBounty * 0.10,
        toggle: 'simple'
      }
    },

    handleToggleClick: function() {
      this.setState({
        toggle: this.state.toggle == 'simple' ? 'advanced' : 'simple'
      })
    },

    handleOfferChange: function() {
      // do nothing so far
    },

    renderValueControl: function() {
      if(this.state.toggle === 'simple') {
        return (
          <SimpleNewBountyOffer
            product={this.props.product}
            user={this.props.user}
            maxOffer={this.props.maxOffer}
            newOffer={this.state.newOffer}
            averageBounty={this.props.averageBounty}
            coinsMinted={this.props.coinsMinted}
            profitLastMonth={this.props.profitLastMonth}
            onChange={this.handleOfferChange} />
        )
      } else {
        return (
          <AdvancedNewBountyOffer
            product={this.props.product}
            user={this.props.user}
            maxOffer={this.props.maxOffer}
            newOffer={this.state.newOffer}
            averageBounty={this.props.averageBounty}
            coinsMinted={this.props.coinsMinted}
            profitLastMonth={this.props.profitLastMonth}
            onChange={this.handleOfferChange} />
        )
      }
    },

    render: function() {
      var toggle = <a onClick={this.handleToggleClick} href="#">{this.state.toggle == 'simple' ? 'Advanced' : 'Simple'}</a>

      return (
        <div className="form-group">
          <div className="btn-group right">
            {toggle}
          </div>

          <label className="control-label">
            Value
          </label>

          <div style={{ height: 200 }}>
            {this.renderValueControl()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InitialOffer;
  }

  window.InitialOffer = InitialOffer;
})();
