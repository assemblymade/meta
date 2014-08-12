/** @jsx React.DOM */

(function() {
  var BountyValuation = React.createClass({
    getInitialState: function() {
      return {
        popoverShown: false,
      }
    },

    render: function() {
      return <BsPopover
        content={BountyBreakdown(this.props)}
        placement="bottom"
        visible={this.state.popoverShown}
        onHide={this.handleHide}>
          <a className="text-coins" href="#" id="bounty-amount-link" onClick={this.togglePopover}>
            <span className="icon icon-app-coin"></span>
              {numeral(this.props.contracts.earnable).format('0,0')}
            <span className="caret"></span>
          </a>
        </BsPopover>
    },

    togglePopover: function() {
      this.setState({popoverShown: !this.state.popoverShown })
      return false
    },

    handleHide: function() {
      this.setState({popoverShown: false})
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyValuation;
  }

  window.BountyValuation = BountyValuation;
})();
