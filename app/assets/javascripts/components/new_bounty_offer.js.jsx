(function() {
  var classSet = React.addons.classSet;
  var min = 1
  var scale = 1.05
  var initialVal = 25

  var NewBountyOffer = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    componentDidMount: function() {
      this.props.onChange(this.scaleOffer(initialVal));
    },

    descriptionClasses: function(factor) {
      return classSet({
        'text-success': (factor <= 0.9),
        'text-primary': (factor > 0.9 && factor < 1.1),
        'text-warning': (factor > 1.1)
      });
    },

    factor: function() {
      var factor = this.props.newOffer / this.props.averageBounty;

      if (factor <= 0.5) {
        return factor;
      } else if (factor <= 1) {
        return Math.floor((factor * 10)) / 10;
      }

      return Math.floor((factor * 4)) / 4;
    },

    render: function() {
      return <div>
        <div className="clearfix text-muted text-small row">
          <span className="col-md-6">Simple</span>
          <span className="col-md-6 text-right">Complex</span>
        </div>
        <input type="range" min="0" max="100" onChange={this.handleOfferChanged} defaultValue={initialVal} />
        <div className="row">

          <span className="text-right text-small col-md-12">
            <span className="text-coins text-small" style={{"margin-right": "5px"}}>
              <span className="icon icon-app-coin"></span>
              {numeral(this.props.newOffer).format('0,0')}
            </span>
            ({this.relativeSize()}
            <span> the average {this.props.product.name} bounty</span>)
          </span>
        </div>
      </div>
    },

    handleOfferChanged: function(e) {
      this.props.onChange(this.scaleOffer(e.target.value));
    },

    relativeSize: function() {
      var factor = this.factor();
      var descriptor;

      return (
        <span>
          <strong>
            <span className={this.descriptionClasses(factor)}>
              {numeral(factor).format('0.00a')}x
            </span>
          </strong>
        </span>
      );
    },

    scaleOffer: function(val) {
      var multiplier = (this.props.maxOffer - min) / (Math.pow(scale, 99) - 1);
      var shift = min - multiplier;

      return Math.min(
        Math.pow(scale, val) * multiplier + shift, this.props.maxOffer
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewBountyOffer;
  }

  window.NewBountyOffer = NewBountyOffer;
})();
