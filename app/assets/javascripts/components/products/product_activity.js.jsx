'use strict';

const NewsFeed = require('../news_feed/news_feed.js.jsx');
const ProductStore = require('../../stores/product_store');

let ProductActivity = React.createClass({
  getInitialState() {
    return {
      product: ProductStore.getProduct()
    };
  },

  render() {

  }
});

module.exports = ProductActivity;
