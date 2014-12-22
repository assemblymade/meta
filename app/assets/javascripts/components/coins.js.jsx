
module.exports = React.createClass({
  propTypes: {
    coins: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <a className="text-coins bold" href="#" id="bounty-amount-link">
        <span className="icon icon-app-coin fs5 pr1" style={{marginRight: "-1px"}}></span>
        {numeral(this.props.coins).format('0,0')}
      </a>
    )
  }
})
