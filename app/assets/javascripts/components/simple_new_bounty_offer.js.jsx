(function() {
  var SimpleNewBountyOffer = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    suggestions: function() {
      var middle = Math.round(this.props.averageBounty / 1000) * 1000
      var scale = Math.round(middle / 10 / 1000) * 1000

      return [1, 2, 3, 4, 5].map(function(i) {
        return scale * Math.pow(i, 2)
      })
    },

    renderSuggestionList: function() {
      return this.suggestions().map(function(suggestion) {
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

    examples: function(suggestion) {
      return [
        ['Bug fixes', 'Feedback'],
        ['Mockups', 'Feature dev', 'Homepage copy'],
        ['Site redesign', 'Execute marketing plan', 'Implement major feature']
      ];
    },

    render: function() {
      return (
        <div className="px4 py3">
          <Slider steps={this.suggestions()} />
        </div>
      )
    },

    handleOfferChange: function(e) {
      this.props.onChange(this.suggestions()[e.target.value]);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = SimpleNewBountyOffer;
  }

  window.SimpleNewBountyOffer = SimpleNewBountyOffer;
})();
