var IconWithNumber = require('./ui/icon_with_number.js.jsx')

module.exports = React.createClass({
  displayName: 'AppCoins',

  propTypes: {
    n: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <span className="text-coins bold">
        <IconWithNumber icon="app-coin" n={this.props.n} />
      </span>
    )
  }
})
