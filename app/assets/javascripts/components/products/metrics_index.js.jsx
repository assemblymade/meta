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
              {this.state.metrics ? <MetricsChart data={this.state.metrics} /> : <Spinner />}
            </div>
          </Tile>
        </div>
      </div>
    </div>
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

var MetricsChart = React.createClass({
  render() {
    return <div id="metrics" />
  },

  componentDidMount() {
    this.renderChart()
  },

  renderChart() {
    var incomplete = {
      start: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      style: 'dashed'
    }

    c3.generate({
      bindto: '#metrics',
      axis: {
        x: { type: 'timeseries' }
      },
      color: {
        pattern: ['#0ECEFF', '#b8f1ff']
      },
      data: {
        json: this.props.data,
        keys: {
          x: 'date',
          value: ['uniques', 'visits'],
        },
        names: {
          uniques: 'Unique Visitors',
          visits: 'Total Visits'
        },
        regions: {
          uniques: [incomplete],
          visits: [incomplete],
        },
        types: {
          uniques: 'area',
          visits: 'area'
        }
      }
    });
  }

})

module.exports = MetricsIndex
