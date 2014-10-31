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

    renderExampleList: function() {
      return this.examples().map(function(example) {
        return (
          <li className="left gray"
            style={{ width: '33%', 'text-align': 'center !important' }}
            dangerouslySetInnerHTML={{ __html: example.join(', <br/>') }} />
        )
      }.bind(this))
    },

    render: function() {
      return (
        <div className="px4 py3">
          <ul className="list-unstyled mxn4">
            {this.renderSuggestionList()}
          </ul>

          <input type="range" min="1" max="5" step="1" list="steps" onChange={this.handleOfferChange} />

          <datalist id="steps">
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option value="4"></option>
            <option value="5"></option>
          </datalist>

          <ul className="list-unstyled align-left h6 py2" style={{ 'margin': '0 -21%' }}>
            {this.renderExampleList()}
          </ul>
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
