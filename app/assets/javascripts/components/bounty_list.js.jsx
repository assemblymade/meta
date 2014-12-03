/** @jsx React.DOM */

(function() {
  var BountyActionCreators = require('../actions/bounty_action_creators.js')

  var BountyList = React.createClass({
    getInitialState: function() {
      return {
        bounties: this.props.bounties
      }
    },

    handleMouseDown: function(bounty, event) {
      var bountyDiv = event.target.parentElement.parentElement
      var height = $(bountyDiv).outerHeight()

      var bounties = this.state.bounties;
      var index = bounties.indexOf(bounty);

      placeholder = { placeholder: true, height: height }

      bounties.splice(index, 0, placeholder);

      this.setState({
        bounties: bounties
      })
    },

    renderBounties: function() {
      if(!this.props.bounties.length) {
        return
      }

      var product = this.props.product

      return this.props.bounties.map(function(bounty) {
        if(bounty.placeholder) {
          return (
            <div className="bg-black mb3" style={{ height: bounty.height }}></div>
          )
        } else {
          return (
            <BountyListItem bounty={bounty} product={product} valuation={this.props.valuation} handleMouseDown={this.handleMouseDown} handleMouseMove={this.handleMouseMove} handleMouseUp={this.handleMouseUp} key={bounty.id} />
          )
        }
      }.bind(this))
    },

    // TODO
    renderEmptyState: function() {
    },

    render: function() {
      return (
        <div className="row">
          <div className="col-xs-12">
            {this.renderBounties()}
            {this.renderEmptyState()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyList
  }

  window.BountyList = BountyList
})();
