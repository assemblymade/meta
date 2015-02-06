'use strict';

const Discussion = require('../ui/discussion.js.jsx');
const NewsFeedItemStore = require('../../stores/news_feed_item_store');
const PostStore = require('../../stores/post_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const Update = require('../update.js.jsx');

let ProductPost = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    let {
      product: { name },
      target: { title }
    } = this.state.item;

    document.title = title + ' · ' + name;

    NewsFeedItemStore.addChangeListener(this.onNewsFeedItemChange);
    PostStore.addChangeListener(this.onPostChange);
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    NewsFeedItemStore.removeChangeListener(this.onNewsFeedItemChange);
    PostStore.removeChangeListener(this.onPostChange);
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      item: NewsFeedItemStore.getItem(),
      post: PostStore.getPost(),
      product: ProductStore.getProduct()
    };
  },

  onNewsFeedItemChange() {
    this.setState({
      item: NewsFeedItemStore.getItem(),
    });
  },

  onPostChange() {
    this.setState({
      post: PostStore.getPost()
    });
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct(),
    });
  },

  render() {
    let {
      item,
      post,
      product
    } = this.state;

    return (
      <div>
        <ProductHeader product={product} />
        <div className="container mt3">
          <Discussion newsFeedItem={item}>
            <Update newsFeedItem={item}
                productSlug={product.slug}
                update={post} />
          </Discussion>
        </div>
      </div>
    );
  }
});

module.exports = ProductPost;
