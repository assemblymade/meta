(function() {
  var min = 1
  var scale = 1.05

  var NewBountyOffer = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    componentDidMount: function() {
      this.props.onChange(this.scaleOffer(50))
    },

    render: function() {
      return <div>
          <div className="clearfix text-muted small">
            <span className="pull-left">Simple</span>
            <span className="pull-right">Complex</span>
          </div>
          <input type="range" min="0" max="100" onChange={this.handleOfferChanged} defaultValue={50} />
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
      this.props.onChange(this.scaleOffer(e.target.value))
    },

    scaleOffer: function(val) {
      var multiplier = (this.props.maxOffer - min) / (Math.pow(scale, 99) - 1)
      var shift = min - multiplier
      return Math.pow(scale, val) * multiplier + shift
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
