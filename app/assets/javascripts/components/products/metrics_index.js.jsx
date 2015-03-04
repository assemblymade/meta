const MetricsCharts = require('./metrics_charts.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store.js');
const Routes = require('../../routes.js');

module.exports = React.createClass({
  displayName: 'MetricsIndex',

  render() {
    return <div>
      <ProductHeader />

      <div className="container mt3">
        <div className="clearfix py3">
          <ul className="new-nav new-nav--horizontal">
            <li className="new-nav-item new-nav-item--active">
              <a href={Routes.product_metrics_path({product_id: ProductStore.getProduct().slug}) }>
                Performance Metrics
              </a>
            </li>
            <li className="new-nav-item">
              <a href={Routes.product_financials_path({product_id: ProductStore.getProduct().slug}) }>
                Financials
              </a>
            </li>
          </ul>
        </div>


        <MetricsCharts />
      </div>
    </div>
  }
})
