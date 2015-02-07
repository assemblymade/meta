'use strict';

const PostsIndex = require('../posts/posts_index.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');

let ProductPosts = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = 'Posts · ' + this.state.product.name;

    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      product: ProductStore.getProduct()
    };
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct()
    });
  },

  render() {
    let product = this.state.product;

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <PostsIndex product={product} />
        </div>
      </div>
    );
  }
});

module.exports = ProductPosts;
