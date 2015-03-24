var BountyActionCreators = require('../actions/bounty_action_creators.js')
var BountyListItem = require('./bounty_list_item.js.jsx')
var BountiesStore = require('../stores/bounties_store.js')
var PaginationLinks = require('./pagination_links.js.jsx')
var Spinner = require('./spinner.js.jsx')

var BountyList = React.createClass({
  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentDidMount: function() {
    BountiesStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    BountiesStore.removeChangeListener(this._onChange)
  },

  renderBounties: function() {
    if (!this.state.bounties.length) {
      return null;
    }

    var product = this.props.product

    return this.state.bounties.map(function(bounty) {
      if (bounty.placeholder) {
        return (
          <div className="bg-gray-5 mb3 rounded" style={{ height: bounty.height }} />
        )
      }

      return (
        <BountyListItem bounty={bounty}
            product={product}
            valuation={this.props.valuation}
            handleMouseDown={this.handleMouseDown}
            handleMouseMove={this.handleMouseMove}
            handleMouseUp={this.handleMouseUp}
            key={bounty.id}
            index={this.state.bounties.indexOf(bounty)}
            draggable={this.props.draggable} />
      );
    }.bind(this))
  },

  renderSpinner: function() {
    if(this.state.loading) {
      return <Spinner />
    }
  },

  render: function() {
    return (
      <div className="relative">
        {this.renderBounties()}
        {this.renderSpinner()}
      </div>
    )
  },

  getStateFromStore: function() {
    return {
      bounties: BountiesStore.getBounties(),
      loading: BountiesStore.getLoading()
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }
});

module.exports = BountyList
