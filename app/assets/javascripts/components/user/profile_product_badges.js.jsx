'use strict'

var AppIcon = require('../app_icon.js.jsx')
var ProductsStore = require('../../stores/products_store')

module.exports = React.createClass({
  getInitialState() {
    return this.getStateFromStores()
  },

  render() {
    if (!this.state.products || this.state.products.length == 0) {
      return <div />
    }
    return <div className="clearfix">
      <h6>Products involved in</h6>
      {this.state.products.map(this.renderProduct)}
    </div>
  },

  renderProduct(product) {
    if (!product.flagged) {
      return <div key={product.id} className="left mr1 mt1" data-toggle="tooltip" title={product.name.replace(' ', '\u00a0')}>
        <a href={product.url}>
          <AppIcon app={product} className="left" size={35} />
        </a>
      </div>
    }
    else {
      return <div></div>
    }

  },

  componentDidMount() {
    ProductsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount() {
    ProductsStore.removeChangeListener(this._onChange)
  },

  getStateFromStores() {
    return {
      products: ProductsStore.getProducts()
    }
  },

  _onChange() {
    this.setState(this.getStateFromStores())
  }
})
