var IconWithNumber = require('./ui/icon_with_number.js.jsx')

var AppCoins = React.createClass({

  propTypes: {
    n: React.PropTypes.number.isRequired,
    color: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      color: 'yellow'
    }
  },

  render() {
    return (
      <span className={this.props.color}>
        <IconWithNumber icon="app-coin" n={this.props.n} showZeros={true} />
      </span>
    )
  }
})

module.exports = window.AppCoins = AppCoins
