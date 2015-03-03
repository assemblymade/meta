'use strict';

const AssetsStore = require('../../stores/assets_store');
const BountyIndex = require('../bounty_index.js.jsx');
const BountyMarksStore = require('../../stores/bounty_marks_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const qs = require('qs');
const url = require('url');
const ValuationStore = require('../../stores/valuation_store');

let ProductBounties = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = 'Bounties · ' + this.state.product.name;

    let query = qs.parse(
      url.parse(window.location.toString()).query
    );

    if (query && query.modal) {
      window.showCreateBounty && window.showCreateBounty();
    }

    AssetsStore.addChangeListener(this.onAssetsChange);
    BountyMarksStore.addChangeListener(this.onBountyMarksChange);
    ProductStore.addChangeListener(this.onProductChange);
    ValuationStore.addChangeListener(this.onValuationChange);
  },

  componentWillUnmount() {
    AssetsStore.removeChangeListener(this.onAssetsChange);
    BountyMarksStore.removeChangeListener(this.onBountyMarksChange);
    ProductStore.removeChangeListener(this.onProductChange);
    ValuationStore.removeChangeListener(this.onValuationChange);
  },

  getInitialState() {
    return {
      assets: AssetsStore.getAssets(),
      product: ProductStore.getProduct(),
      tags: BountyMarksStore.getMarks(),
      valuation: ValuationStore.getValuation()
    };
  },

  onAssetsChange() {
    this.setState({
      assets: AssetsStore.getAssets()
    });
  },

  onBountyMarksChange() {
    this.setState({
      tags: BountyMarksStore.getMarks(),
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
      assets,
      product,
      tags,
      valuation
    } = this.state;

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <BountyIndex tags={tags}
                    product={product}
                    valuation={valuation}
                    assets={assets} />
        </div>
      </div>
    );
  }
});

module.exports = ProductBounties;
