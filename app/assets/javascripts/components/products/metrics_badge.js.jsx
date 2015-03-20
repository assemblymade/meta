'use strict';

const ProductMetricsStore = require('../../stores/product_metrics_store.js')
const ProductMetricsActionCreators = require('../../actions/product_metrics_actions.js')
const ProductStore = require('../../stores/product_store.js')
const Routes = require('../../routes')
const UserStore = require('../../stores/user_store.js')

module.exports = React.createClass({
  displayName: 'MetricsBadge',

  propTypes: {
    product: React.PropTypes.object.isRequired
  },

  render() {
    let product = this.props.product
    let totalVisitors = product.total_visitors

    if (totalVisitors == null || totalVisitors == 0) {
      return this.renderEmptyState()
    }

    if (totalVisitors < 1000) {
      return <div />
    }

    return <div className="px3 py2">
      <span className="gray-2">Used by </span>
      <span>{this.cleanNumber(totalVisitors)}</span>
      <span className="gray-2"> people</span>
    </div>
  },

  renderEmptyState() {
    let {product} = this.props
    
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      return <div className="px3 py2 border-top">
        <span className="yellow"><Icon icon="exclamation-triangle" /> </span>
        <a href={Routes.snippet_product_metrics_path({product_id: product.slug})} className="gray-1 text-stealth-link">Set up metric collection</a>
      </div>
    }
    return null
  },

  cleanNumber(i) {
    if (i < 1000) {
      return i
    }
    if (i < 10000) {
      return `${parseFloat((i/1000).toFixed(1))}K`
    }
    if (i < 1000000) {
      return `${parseFloat((i/1000).toFixed(0))}K`
    }
    return `${parseFloat((i/1000000).toFixed(1))}M`
  }
})
