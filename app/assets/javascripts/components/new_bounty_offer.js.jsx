(function() {
  var min = 1
  var scale = 1.05
  var initialVal = 25

  var NewBountyOffer = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    componentDidMount: function() {
      this.props.onChange(this.scaleOffer(initialVal))
    },

    render: function() {
      return <div>
        <div className="clearfix text-muted text-small row">
          <span className="col-md-6">Simple</span>
          <span className="col-md-6 text-right">Complex</span>
        </div>
        <input type="range" min="0" max="100" onChange={this.handleOfferChanged} defaultValue={initialVal} />
        <div className="row">
          <span className="text-coins text-small col-md-2">
            <span className="icon icon-app-coin"></span>
            {numeral(this.props.newOffer).format('0,0')}
          </span>
          <span className="text-right text-small col-md-10">
            <span className="text-success">
              {this.relativeSize()}
            </span>
            <span> the average {this.props.product.name} bounty.</span>
          </span>
        </div>
      </div>
    },

    handleOfferChanged: function(e) {
      this.props.onChange(this.scaleOffer(e.target.value))
    },

    scaleOffer: function(val) {
      var multiplier = (this.props.maxOffer - min) / (Math.pow(scale, 99) - 1)
      var shift = min - multiplier
      return Math.min(
        Math.pow(scale, val) * multiplier + shift, this.props.maxOffer
      )
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
