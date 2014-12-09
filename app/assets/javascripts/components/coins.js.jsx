
module.exports = React.createClass({
  propTypes: {
    coins: React.PropTypes.number.isRequired
  },

  render: function() {
    return <span className="text-coins bold" href="#" id="bounty-amount-link">
      <span className="icon icon-app-coin"></span>
      {' '}
      {numeral(this.props.coins).format('0,0')}
      {' '}
    </span>
  }
})
