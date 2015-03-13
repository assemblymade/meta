'use strict'

var AppIcon = require('../app_icon.js.jsx')
var BountiesAwardedStore = require('../../stores/bounties_awarded_store')
var Icon = require('../ui/icon.js.jsx')
var OwnershipActions = require('../../actions/ownership_actions')
var PeopleStore = require('../../stores/people_store')
var Spinner = require('../ui/spinner.js.jsx')
var url = require('url')

module.exports = React.createClass({
  displayName: 'ProfileHeartsReceived',

  getInitialState() {
    return this.getStateFromStores()
  },

  render() {
    if (!this.state.awards) {
      return <Spinner />
    }

    return this.renderBountiesAwarded()
  },

  renderBountiesAwarded() {
    var product = null

    let bounties = this.state.awards.map(a => {
      var heading = null
      if (product == null || (a.bounty.product.id != product.id)) {
        product = a.bounty.product
        heading = <div className="px2 pb2 pt3">
          <div className="right">
            <AppCoins n={this.coins(product.id)} />
          </div>
          <div className="right mr1 gray-3">
            <span>{this.ownership(product.id)}</span>
          </div>

          <div className="left pr1">
            <AppIcon app={product} className="left" />
          </div>
          {product.name}
        </div>
      }

      return <div>{heading}{this.renderBounty(a, heading != null)}</div>
    })

    return <div>{bounties}</div>
  },

  renderBounty(award, showBorder) {
    return <div className={showBorder ? "border-top border-gray-5" : null}>
      <a href={award.bounty.url}
          className="p2 block bg-gray-6-hover ellipsis relative">

        <div className="right">
          <AppCoins n={award.coins} color="gray-2" />
        </div>

        {award.bounty.title}
      </a>
    </div>
  },

  coins(product_id) {
    return BountiesAwardedStore.getCoins(product_id)
  },

  ownership(product_id) {
    let o = this.coins(product_id) / BountiesAwardedStore.getTotal(product_id)
    return `${Math.round(o * 100)}%`
  },

  componentDidMount() {
    BountiesAwardedStore.addChangeListener(this._onChange)
    OwnershipActions.feedSelected(this.props.user_id)
  },

  componentWillUnmount() {
    BountiesAwardedStore.removeChangeListener(this._onChange)
  },

  getStateFromStores() {
    return {
      awards: BountiesAwardedStore.getAwards()
    }
  },

  _onChange() {
    this.setState(this.getStateFromStores())
  }
})
