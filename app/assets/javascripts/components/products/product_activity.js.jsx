'use strict';

const Button = require('../ui/button.js.jsx');
const CreateProductItem = require('../create_product_item.js.jsx');
const IntroductionActions = require('../../actions/introduction_actions');
const IntroductionStore = require('../../stores/introduction_store');
const NewsFeed = require('../news_feed/news_feed.js.jsx');
const NewsFeedItemsStore = require('../../stores/news_feed_items_store');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const Routes = require('../../routes');
const Tile = require('../ui/tile.js.jsx');
const UserStore = require('../../stores/user_store');

let ProductActivity = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  componentDidMount() {
    IntroductionStore.addChangeListener(this.onIntroductionChange);
    NewsFeedItemsStore.addChangeListener(this.onNewsFeedChange);
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    IntroductionStore.removeChangeListener(this.onIntroductionChange);
    NewsFeedItemsStore.removeChangeListener(this.onNewsFeedChange);
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      introduction: IntroductionStore.getIntroduction(),
      items: NewsFeedItemsStore.getNewsFeedItems(),
      product: ProductStore.getProduct()
    };
  },

  handleIntroductionChange(e) {
    IntroductionActions.updateIntroduction(e.target.value);
  },

  handleIntroductionSubmit() {
    let introduction = IntroductionStore.getIntroduction();
    let product = this.state.product;
    let slug = product.slug;
    let userId = UserStore.getId();

    IntroductionActions.submitIntroduction(slug, userId, introduction)
  },

  onIntroductionChange() {
    this.setState({
      introduction: IntroductionStore.getIntroduction()
    });
  },

  onNewsFeedChange() {
    this.setState({
      items: NewsFeedItemsStore.getNewsFeedItems()
    });
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct()
    });
  },

  render() {
    let product = this.state.product;
    let slug = product.slug;
    let leftColumnClasses = React.addons.classSet({
      'mb2': true,
      'px3': true,
      'sm-col': true,
      'sm-col-8': true,
      'sm-mb0': true
    });

    let rightColumnClasses = React.addons.classSet({
      'md-col': true,
      'md-col-4': true,
      'px3': true
    });

    return (
      <div>
        <ProductHeader product={product} />

        <div className="container mt3">
          <div className="clearfix mxn3">
            <div className={leftColumnClasses}>
              <NewsFeed items={this.state.items}
                  productPage={true}
                  url={product.url} />
            </div>

            <div className={rightColumnClasses}>
              <Tile>
                {this.renderIntroductionForm()}
              </Tile>

              {this.renderCreateBounty()}

              <ProductImportantLinks product={product} />
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderCreateBounty() {
    let product = this.state.product;

    return <CreateProductItem product={product} activeMenuItem="bounty" />;
  },

  renderIntroductionForm() {
    let product = this.state.product;
    let user = UserStore.getUser();

    if (user && !product.is_member) {
      return (
        <Tile>
          <div className="p3">
            <div className="clearfix">
              <h4 className="mt0 mb2">Hey {user.username}!</h4>
              <div className="right"></div>
            </div>
            <p>Ready to pitch in on {product.name}? Introduce yourself.</p>
            <textarea className="form-control mb2"
              onChange={this.handleIntroductionChange}
              placeholder="What do you like to do? What is your favorite sandwich?"
              rows="2"
              value={this.state.introduction}></textarea>
            <div className="center">
              <Button type="primary" action={this.handleIntroductionSubmit}>
                Introduce yourself!
              </Button>
            </div>
          </div>
        </Tile>
      );
    }
  }
});

module.exports = ProductActivity;
