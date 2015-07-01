const assets = require('../../assets.js')
const Chart = require('../ui/chart.js.jsx');
const MetricsActions = require('../../actions/product_metrics_actions.js');
const MetricsStore = require('../../stores/product_metrics_store.js');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store.js');
const Routes = require('../../routes.js')
const Spinner = require('../spinner.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const UserStore = require('../../stores/user_store.js')

var MetricsCharts = React.createClass({
  getInitialState() {
    return {
      product: ProductStore.getProduct()
    }
  },

  render() {
    if (!this.state.metrics) {
      return <Spinner />
    }

    if (this.state.metrics.size == 0) {
      return this.renderNoData()
    } else {
      return this.renderCharts()
    }
  },

  renderCharts() {
    return <div className="mb4">
      <div className="mb2">
        <h6 className="gray-2 caps mt0 mb0">Daily Metrics</h6>
      </div>

      <div className="mxn2">
        <Chart id="visitors" options={this.visitorChartOptions()} />
        <Chart id="accounts" options={this.accountChartOptions()} />
      </div>
    </div>
  },

  renderNoData() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      return this.renderAddMetrics()
    } else {
      return this.renderEmptyState()
    }
  },

  renderAddMetrics() {
    return this.blurredImage(() =>
      <div>
        <h3 className="mt0">
          Metrics setup guide
        </h3>
        <p>Configuring Assembly metrics integration allows you to see and show off your products success with the world.</p>

        <p>This example can be dropped into an ERB template for rails, you&#39;ll need to modify it for other languages and web frameworks.</p>

        <pre><code style={{fontSize:12}}>{this.state.product.asmlytics_snippet}</code></pre>

        <p>iOS and Android setup guides are coming soon.</p>
      </div>
    )
  },

  renderEmptyState() {
    return this.blurredImage(() =>
      <div className="center">
        <h3 className="mt0">
          No metrics collected yet
        </h3>
        <p>Once {this.state.product.name} is up and running its metrics will appear here</p>
      </div>
    )
  },

  blurredImage(children) {
    return <div style={{position:'relative', minHeight: 600 }}>
      <img src={assets.url('assets/product/metrics_blurred.png')} className="img-responsive" style={{position: 'absolute'}} />
      <Tile>
        <div className="col-xs-12 col-md-10 col-md-offset-1 mt2">
          <div className="well well-lg">
            {children()}
          </div>
        </div>
      </Tile>
    </div>
  },

  visitorChartOptions() {
    return {
      bindto: '#visitors',
      axis: {
        x: { type: 'timeseries' }
      },
      color: {
        pattern: ['#0ECEFF', '#b8f1ff']
      },
      data: {
        json: this.state.metrics,
        keys: {
          x: 'date',
          value: ['uniques', 'visits'],
        },
        names: {
          uniques: 'Unique Visitors',
          visits: 'Total Visits'
        },
        regions: {
          uniques: [this.incompleteRegion()],
          visits: [this.incompleteRegion()],
        },
        types: {
          uniques: 'area',
          visits: 'area'
        }
      },
      size: {
        height: 200
      }
    }
  },

  accountChartOptions() {
    return {
      bindto: '#accounts',
      axis: {
        x: { type: 'timeseries' }
      },
      color: {
        pattern: ['#81B325']
      },
      data: {
        json: this.state.metrics,
        keys: {
          x: 'date',
          value: ['total_accounts'],
        },
        names: {
          total_accounts: 'Total Accounts'
        },
        regions: {
          total_accounts: [this.incompleteRegion()],
        },
        types: {
          total_accounts: 'area'
        }
      },
      size: {
        height: 200
      }
    }
  },

  incompleteRegion() {
    return {
      start: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      style: 'dashed'
    }
  },

  componentDidMount() {
    MetricsActions.fetchDailies(this.state.product)
    MetricsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    MetricsStore.removeChangeListener(this._onChange)
  },

  _onChange() {
    this.setState({metrics: MetricsStore.getAll()})
  }
})

module.exports = MetricsCharts
