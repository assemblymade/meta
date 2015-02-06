'use strict';

const Bounty = require('../bounty.js.jsx');
const BountyMarksStore = require('../../stores/bounty_marks_store');
const Discussion = require('../ui/discussion.js.jsx');
const NewsFeedItemStore = require('../../stores/news_feed_item_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const ValuationStore = require('../../stores/valuation_store');

let ProductBounty = React.createClass({
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
    BountyMarksStore.addChangeListener(this.onBountyMarksChange);
    NewsFeedItemStore.addChangeListener(this.onNewsFeedItemChange);
    ProductStore.addChangeListener(this.onProductChange);
    ValuationStore.addChangeListener(this.onValuationChange);
  },

  componentWillUnmount() {
    BountyMarksStore.removeChangeListener(this.onBountyMarksChange);
    NewsFeedItemStore.removeChangeListener(this.onNewsFeedItemChange);
    ProductStore.removeChangeListener(this.onProductChange);
    ValuationStore.removeChangeListener(this.onValuationChange);
  },

  getInitialState() {
    return {
      item: NewsFeedItemStore.getItem(),
      product: ProductStore.getProduct(),
      tags: BountyMarksStore.getMarkNames(),
      valuation: ValuationStore.getValuation()
    };
  },

  onBountyMarksChange() {
    this.setState({
      tags: BountyMarksStore.getMarkNames(),
    });
  },

  onNewsFeedItemChange() {
    this.setState({
      item: NewsFeedItemStore.getItem(),
    });
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct(),
    });
  },

  onValuationChange() {
    this.setState({
      valuation: ValuationStore.getValuation()
    });
  },

  render() {
    let {
      bounty,
      item,
      product,
      tags,
      valuation
    } = this.state;

    return (
      <div>
        <ProductHeader product={product} />
        <div className="container mt3">
          <Discussion newsFeedItem={item}>
            <Bounty item={item}
                showCoins={product.slug !== 'meta'}
                valuation={valuation} />
          </Discussion>
        </div>
      </div>
    );
  }
});

module.exports = ProductBounty;
