var BountyListItem = require('./bounty_list_item.js.jsx')

module.exports = React.createClass({
  renderBounties: function() {
    if(!this.props.bounties.length) {
      return
    }

    var product = this.props.product

    return this.props.bounties.map(function(bounty) {
      return (
        <BountyListItem bounty={bounty} product={product} />
      )
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
