const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store.js');
const Tile = require('../ui/tile.js.jsx');

var MetricsSnippet = React.createClass({
  getInitialState() {
    return {
      product: ProductStore.getProduct()
    }
  },

  render() {
    return <div>
      <ProductHeader />

      <div className="container clearfix mt3">
        <div className="col-9 mx-auto">
          <Tile>
          </Tile>
        </div>
      </div>
    </div>
  }
})

module.exports = MetricsSnippet
