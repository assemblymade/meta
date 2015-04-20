'use strict';

const Bounty = require('../bounty.js.jsx');
const BountyActions = require('../../actions/bounty_actions');
const BountyMarksStore = require('../../stores/bounty_marks_store');
const BountyStore = require('../../stores/bounty_store');
const Discussion = require('../ui/discussion.js.jsx');
const NewsFeedItemStore = require('../../stores/news_feed_item_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const Spinner = require('../spinner.js.jsx');
const ValuationStore = require('../../stores/valuation_store');

let ProductBounty = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    BountyActions.fetch(this.props.params.product_id, this.props.params.id)
    BountyStore.addChangeListener(this.onBountyChange);
    BountyMarksStore.addChangeListener(this.onBountyMarksChange);
    NewsFeedItemStore.addChangeListener(this.onNewsFeedItemChange);
    ProductStore.addChangeListener(this.onProductChange);
    ValuationStore.addChangeListener(this.onValuationChange);
  },

  componentWillUnmount() {
    BountyStore.removeChangeListener(this.onBountyChange);
    BountyMarksStore.removeChangeListener(this.onBountyMarksChange);
    NewsFeedItemStore.removeChangeListener(this.onNewsFeedItemChange);
    ProductStore.removeChangeListener(this.onProductChange);
    ValuationStore.removeChangeListener(this.onValuationChange);

    setTimeout(BountyActions.deselectCurrentBounty, 1)
  },

  getInitialState() {
    return {
      bounty: BountyStore.getBounty(),
      item: NewsFeedItemStore.getItem(),
      product: ProductStore.getProduct(),
      tags: BountyMarksStore.getMarks(),
      valuation: ValuationStore.getValuation()
    };
  },

  onBountyChange() {
    this.setState({
      bounty: BountyStore.getBounty()
    });
  },

  onBountyMarksChange() {
    this.setState({
      tags: BountyMarksStore.getMarks(),
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

    if (item) {
      let {
        target: { number, title }
      } = item;

      document.title = title + ' · #' + number + ' · ' + name;
    }


    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          {!item ? <Spinner /> :
            <Discussion newsFeedItem={item}>
              <Bounty item={item}
                  valuation={valuation} />
            </Discussion>
          }
        </div>
      </div>
    );
  }
});

module.exports = ProductBounty;
