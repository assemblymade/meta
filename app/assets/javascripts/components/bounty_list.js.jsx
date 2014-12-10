var BountyActionCreators = require('../actions/bounty_action_creators.js')
var BountyListItem = require('./bounty_list_item.js.jsx')
var BountiesStore = require('../stores/bounties_store.js')
var PaginationLinks = require('./pagination_links.js.jsx')
var Spinner = require('./spinner.js.jsx')

var BountyList = React.createClass({
  displayName: 'BountyList',

  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentDidMount: function() {
    BountiesStore.addListener('change', this._onChange)
  },

  componentWillUnmount: function() {
    BountiesStore.removeListener('change', this._onChange)
  },

  renderBounties: function() {
    if(!this.state.bounties.length) {
      return
    }

    var product = this.props.product

    return this.state.bounties.map(function(bounty) {
      if(bounty.placeholder) {
        return (
          <div className="bg-gray-light mb3 rounded" style={{ height: bounty.height }}></div>
        )
      } else {
        return (
          <BountyListItem bounty={bounty} product={product} valuation={this.props.valuation} handleMouseDown={this.handleMouseDown} handleMouseMove={this.handleMouseMove} handleMouseUp={this.handleMouseUp} key={bounty.id} index={this.state.bounties.indexOf(bounty)} draggable={this.props.draggable} />
        )
      }
    }.bind(this))
  },

  renderSpinner: function() {
    if(this.state.loading) {
      return <Spinner />
    }
  },

  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12">
          {this.renderBounties()}
          {this.renderSpinner()}
        </div>
      </div>
    )
  },

  getStateFromStore: function() {
    return {
      bounties: BountiesStore.getBounties(),
      page: BountiesStore.getPage(),
      pages: BountiesStore.getPages(),
      loading: BountiesStore.getLoading()
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }
})

module.exports = BountyList
