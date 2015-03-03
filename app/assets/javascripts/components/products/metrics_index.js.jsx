const Chart = require('../ui/chart.js.jsx');
const MetricsActions = require('../../actions/product_metrics_actions.js');
const MetricsStore = require('../../stores/product_metrics_store.js');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store.js');
const Spinner = require('../spinner.js.jsx');
const Tile = require('../ui/tile.js.jsx');

var MetricsIndex = React.createClass({
  getInitialState() {
    return {
      product: ProductStore.getProduct()
    }
  },

  render() {
    return <div>
      <ProductHeader />

      <div className="clearfix container">
        <div className="col col-12">
          <h2>Daily Metrics</h2>

          <Tile>
            <div className="p4" style={{minHeight: 400}}>
              {this.state.metrics ? this.renderCharts() : <Spinner />}
            </div>
          </Tile>
        </div>
      </div>
    </div>
  },

  renderCharts() {
    return <div>
      <Chart id="visitors" options={this.visitorChartOptions()} />
      <Chart id="accounts" options={this.accountChartOptions()} />
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

module.exports = MetricsIndex
