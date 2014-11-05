(function() {
  var BountyValuationSlider = require('./bounty_valuation_slider.js.jsx')

  var SimpleBountyOffer = React.createClass({
    getDefaultProps: function() {
      return {
        steps: this.suggestions()
      }
    },

    getInitialState: function() {
      var offer = this.props.steps[2]

      if(this.props.onChange) {
        this.props.onChange({ target: { value: offer }})
      }

      return {
        offer: this.props.steps[2]
      }
    },

    suggestions: function() {
      var middle = Math.round(this.props.averageBounty / 1000) * 1000
      var scale = Math.round(middle / 10 / 1000) * 1000

      return [1, 2, 3, 4, 5].map(function(i) {
        return scale * Math.pow(i, 2)
      })
    },

    renderSuggestionList: function() {
      return this.props.steps.map(function(suggestion) {
        return (
          <li className="left center" style={{ width: '20%' }}>
            <div className="text-coins bold h4 align-center">
              <span className="icon icon-app-coin"></span>
              {' '}
              {numeral(suggestion).format('0,0')}
            </div>
          </li>
        )
      })
    },

    render: function() {
      return (
        <div>
          <BountyValuationSlider steps={this.props.steps} onChange={this.handleChange} />
          <input name="earnable" type="hidden" value={this.state.offer} />
        </div>
      )
    },

    handleChange: function(e) {
      this.setState({
        offer: e.target.value
      })

      if(this.props.onChange) {
        this.props.onChange(e);
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = SimpleBountyOffer;
  }

  window.SimpleBountyOffer = SimpleBountyOffer;
})();
