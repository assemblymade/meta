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

    var featuredIndex = _.chain(this.state.bounties).first(3).pluck('placeholder').any(_.identity).value() ? 4 : 3;
    var featuredBounties = _.first(this.state.bounties, featuredIndex);
    var bounties = _.rest(this.state.bounties, featuredIndex);
    var renderListItem = function(bounty) {
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
    }.bind(this);

    return _.compact([
      featuredBounties.map(renderListItem),
      <div className="border-top mt3 mb3" style={{ borderColor: '#D7D7D7' }} />,
      bounties.map(renderListItem)
    ]);
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
