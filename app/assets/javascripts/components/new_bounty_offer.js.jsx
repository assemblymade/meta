(function() {
  var NewBountyOffer = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    render: function() {
      return <div>
          <div className="clearfix text-muted small">
            <span className="pull-left">Simple</span>
            <span className="pull-right">Complex</span>
          </div>
          <input name="offer" type="range" min="0" max={this.props.maxOffer} onChange={this.handleOfferChanged} />
          <br />
          <p>
            <span className="text-success">
              {this.relativeSize()}
            </span>
            <span> the average {this.props.product.name} bounty.</span>
          </p>
        </div>
    },

    handleOfferChanged: function(e) {
      this.props.onChange(e.target.value)
    },

    relativeSize: function() {
      var factor = this.props.newOffer / this.props.averageBounty
      if (factor <= 0.9) {
        return numeral(factor).format('0%') + ' of'
      } else if (factor > 1.1) {
        return numeral(factor - 1).format('0%') + ' more than'
      } else {
        return 'Similar size to'
      }
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = NewBountyOffer;
  }

  window.NewBountyOffer = NewBountyOffer;
})();
