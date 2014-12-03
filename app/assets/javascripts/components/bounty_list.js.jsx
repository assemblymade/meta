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
      var listItem = event.target.parentNode.parentNode
      var height = $(listItem).outerHeight()

      var bounties = this.state.bounties;
      var index = bounties.indexOf(bounty);

      placeholder = { placeholder: true, height: height }

      bounties.splice(index, 0, placeholder);

      this.setState({
        bounties: bounties
      })
    },

    handleMouseMove: function(bounty, position) {
      var offset = $(this.getDOMNode()).offset()

      var title = document.elementFromPoint(position.left + offset.left, position.top + offset.top - 1)
      var listItem = title.parentNode.parentNode.parentNode

      if(!listItem.data || !listItem.data.bountyId) {
        return
      }

      var bountyId = listItem.data.bountyId
      var bounties = this.state.bounties
      var oldIndex = _.pluck(bounties, 'placeholder').indexOf(true)
      var newIndex = _.pluck(bounties, 'id').indexOf(bountyId)

      var placeholder = bounties[oldIndex]

      bounties.splice(oldIndex, 1)
      bounties.splice(newIndex, 0, placeholder)

      this.setState({
        bounties: bounties
      })
    },

    handleMouseUp: function(bounty) {
      var bounties = this.state.bounties

      var bountyIndex = bounties.indexOf(bounty)
      bounties.splice(bountyIndex, 1)

      var placeholderIndex = _.pluck(bounties, 'placeholder').indexOf(true)
      bounties.splice(placeholderIndex, 1, bounty)

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
