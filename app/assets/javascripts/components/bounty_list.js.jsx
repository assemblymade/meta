/** @jsx React.DOM */

(function() {
  var BountyActionCreators = require('../actions/bounty_action_creators.js')
  var BountiesStore = require('../stores/bounties_store.js')
  var PaginationLinks = require('./pagination_links.js.jsx')
  var Spinner = require('./spinner.js.jsx')

  var BountyList = React.createClass({
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
            <div className="bg-gray-light mb3" style={{ height: bounty.height }}></div>
          )
        } else {
          return (
            <BountyListItem bounty={bounty} product={product} valuation={this.props.valuation} handleMouseDown={this.handleMouseDown} handleMouseMove={this.handleMouseMove} handleMouseUp={this.handleMouseUp} key={bounty.id} index={this.state.bounties.indexOf(bounty)} />
          )
        }
      }.bind(this))
    },

    // TODO
    renderEmptyState: function() {
    },

    renderSpinner: function() {
      if (this.state.loading) {
        return <Spinner />
      }
    },

    render: function() {
      return (
        <div className="row">
          <div className="col-xs-12">
            {this.renderBounties()}
            {this.renderEmptyState()}
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
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyList
  }

  window.BountyList = BountyList
})();
