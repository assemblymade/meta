'use strict';

const MetricsActions = require('../../actions/product_metrics_actions')
const ProductStore = require('../../stores/product_store')
const ProductMetricsStore = require('../../stores/product_metrics_store')
const Routes = require('../../routes')
const UserStore = require('../../stores/user_store')

module.exports = React.createClass({
  displayName: 'MetricsLink',

  getInitialState() {
    return { data: null }
  },

  render() {
    if (!this.state.data && this.isCore()) {
      return this.renderAlert()
    }

    return this.renderLink()
  },

  renderLink() {
    return <a className="block py2" href={Routes.product_metrics_path({product_id: this.props.product.slug })}>
      <span className="mr3 gray-2">
        <Icon icon="line-chart" />
      </span>
      Metrics
    </a>
  },

  renderAlert() {
    return <a className="block py2" href={Routes.product_metrics_path({product_id: this.props.product.slug})}>
      <span className="mr3 yellow">
        <Icon icon="exclamation-triangle" />
      </span>
      Set up metric collection
    </a>
  },

  isCore() {
    return ProductStore.isCoreTeam(UserStore.getUser())
  },

  componentDidMount() {
    MetricsActions.fetchDailies(this.props.product)
    ProductMetricsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    ProductMetricsStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState({ data: ProductMetricsStore.getAll() })
  }
})
