// TODO This lib is required in application.js (chrislloyd)
// var numeral = require('numeral')

module.exports = React.createClass({
  displayName: 'AppCoins',

  propTypes: {
    n: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <div className="text-coins">
        <span className="icon icon-app-coin mr1"></span>
        {numeral(this.props.n).format('0,0')}
      </div>
    )
  }
})
