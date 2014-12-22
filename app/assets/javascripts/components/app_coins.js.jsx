// TODO This lib is required in application.js (chrislloyd)
// var numeral = require('numeral')

module.exports = React.createClass({
  displayName: 'AppCoins',

  propTypes: {
    n: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <a className="text-coins bold" href="#" id="bounty-amount-link">
      <span className="icon icon-app-coin fs5 pr1" style={{marginRight: "-1px"}}></span>
        {numeral(this.props.n).format('0,0')}
      </a>
    )
  }
})
