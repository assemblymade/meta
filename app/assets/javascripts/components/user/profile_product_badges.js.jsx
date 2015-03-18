'use strict'

var AppIcon = require('../app_icon.js.jsx')
var ProductsStore = require('../../stores/products_store')

module.exports = React.createClass({
  getInitialState() {
    return this.getStateFromStores()
  },

  render() {
    if (!this.state.products) {
      return <div />
    }
    return <div className="clearfix">{this.state.products.map(this.renderProduct)}</div>
  },

  renderProduct(product) {
    return <div key={product.id} className="left mr1 mt1" data-toggle="tooltip" title={product.name.replace(' ', '\u00a0')}>
      <a href={product.url}>
        <AppIcon app={product} className="left" size={35} />
      </a>
    </div>
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
