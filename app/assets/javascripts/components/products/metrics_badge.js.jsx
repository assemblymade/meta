const Chart = require('../ui/chart.js.jsx');
const ProductMetricsStore = require('../../stores/product_metrics_store.js')
const ProductMetricsActionCreators = require('../../actions/product_metrics_actions.js')
const ProductStore = require('../../stores/product_store.js')
const Routes = require('../../routes.js')
const UserStore = require('../../stores/user_store.js')

var MetricsBadge = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  getInitialState() {
    return { data: null }
  },

  render() {
    if (this.state.data) {
      return this.renderData()
    }
    return null
  },

  renderData() {
    if (this.state.data.count() > 0) {
      return this.renderChart()
    } else {
      return this.renderNoData()
    }
  },

  renderNoData() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      return <div className="px3 py2">
        <span className="yellow"><Icon icon="exclamation-triangle" /> </span>
        <a href={Routes.snippet_product_metrics_path({product_id: this.props.product.slug})} className="gray-1 text-stealth-link">Set up metric collection</a>
      </div>
    }
    return null
  },

  renderChart() {
    return (
      <div className="px3 py2">
        <h5 className="mt0 mb2">
          Daily Visits
        </h5>

        {this.state.data ? <LineChart data={this.state.data} /> : null}

        <div className="gray-3 mt2">
          <a href={Routes.product_metrics_path({ product_id: this.props.product.slug })}
              className="gray-3 underline">
            <small>View all metrics</small>
          </a>
        </div>
      </div>
    )
  },

  componentDidMount() {
    ProductMetricsActionCreators.fetchDailies(this.props.product)
    ProductMetricsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    ProductMetricsStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState({ data: ProductMetricsStore.getAll() })
  }
})

var LineChart = React.createClass({
  render() {
    return <Chart id="product-metrics-chart" options={this.chartOptions()} />
  },

  chartOptions() {
    return {
      bindto: '#product-metrics-chart',
      axis: {
        x: { show: false, type: 'timeseries' },
        y: { show: false }
      },
      color: {
        pattern: ['#a5cdee']
      },
      legend: { show: false },
      data: {
        json: this.props.data,
        keys: {
          x: 'date',
          value: ['visits'],
        },
        types: {
          visits: 'area'
        }
      },
      size: {
        height: 60
      }
    }
  }
})



module.exports = MetricsBadge
