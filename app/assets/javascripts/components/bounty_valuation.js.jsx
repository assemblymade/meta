/** @jsx React.DOM */

(function() {
  var BountyBreakdown = require('./bounty_breakdown.js.jsx');
  var BountyValuation = React.createClass({
    getInitialState: function() {
      return {
        popoverShown: true,
      }
    },

    render: function() {
      return <BsPopover
        content={BountyBreakdown(this.props)}
        placement="bottom"
        visible={this.state.popoverShown}
        onHide={this.handleHide}>
          <a className="text-coins text-weight-bold" href="javascript:;" id="bounty-amount-link" onClick={this.togglePopover}>
            <span className="icon icon-app-coin"></span>
            {' '}
            {numeral(this.props.contracts.earnable).format('0,0')}
          </a>
        </BsPopover>
    },

    togglePopover: function(e) {
      this.setState({
        popoverShown: !this.state.popoverShown
      });
    },

    handleHide: function() {
      this.setState({
        popoverShown: false
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyValuation;
  }

  window.BountyValuation = BountyValuation;
})();
