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
          <div className="p3">
              <h5 className="mt0 mb2" style={{ fontSize: 16 }}>
                Metrics tracking code
              </h5>

              <p>This example can be dropped into an ERB template for rails, you&#39;ll need to modify it for other languages and web frameworks</p>

              <pre><code style={{fontSize:12}}>{this.state.product.asmlytics_snippet}</code></pre>
            </div>
          </Tile>
        </div>
      </div>
    </div>
  }
})

module.exports = MetricsSnippet
