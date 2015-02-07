'use strict';

const BountyMarksStore = require('../../stores/bounty_marks_store');
const Button = require('../ui/button.js.jsx');
const IntroductionActions = require('../../actions/introduction_actions');
const IntroductionStore = require('../../stores/introduction_store');
const NewsFeed = require('../news_feed/news_feed.js.jsx');
const NewsFeedItemsStore = require('../../stores/news_feed_items_store');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductMarksStore = require('../../stores/product_marks_store');
const ProductStore = require('../../stores/product_store');
const Routes = require('../../routes');
const Tile = require('../ui/tile.js.jsx');
const TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
const UserStore = require('../../stores/user_store');

let ProductActivity = React.createClass({
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
    document.title = this.state.product.name;

    BountyMarksStore.addChangeListener(this.onBountyMarksChange);
    IntroductionStore.addChangeListener(this.onIntroductionChange);
    NewsFeedItemsStore.addChangeListener(this.onNewsFeedChange);
    ProductStore.addChangeListener(this.onProductChange);
    ProductMarksStore.addChangeListener(this.onProductMarksChange);
  },

  componentWillUnmount() {
    BountyMarksStore.removeChangeListener(this.onBountyMarksChange);
    IntroductionStore.removeChangeListener(this.onIntroductionChange);
    NewsFeedItemsStore.removeChangeListener(this.onNewsFeedChange);
    ProductStore.removeChangeListener(this.onProductChange);
    ProductMarksStore.removeChangeListener(this.onProductMarksChange);
  },

  getInitialState() {
    return {
      introduction: IntroductionStore.getIntroduction(),
      items: NewsFeedItemsStore.getNewsFeedItems(),
      product: ProductStore.getProduct(),
      productMarks: ProductMarksStore.getMarks(),
      bountyMarks: BountyMarksStore.getMarks()
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

  onBountyMarksChange() {
    this.setState({
      bountyMarks: BountyMarksStore.getMarks()
    });
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

  onProductMarksChange() {
    this.setState({
      productMarks: ProductMarksStore.getMarks()
    })
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
        <ProductHeader />

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

              {this.renderProductMarks()}
              {this.renderBountyMarks()}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderBountyMarks() {
    let bountyMarks = this.state.bountyMarks;
    let product = this.state.product;

    if (bountyMarks.length) {
      let renderedTags = bountyMarks.map((tag, i) => {
        let tagName = tag[0];
        let count = tag[1];

        let href = Routes.product_wips_path({
          params: {
            product_id: product.slug
          },
          data: {
            mark: tagName
          }
        });

        return (
          <li className="mb1 lh0_9" key={tagName + '-' + i}>
            <a href={href} className="pill-hover block py1 px2">
              <span className="fs1 fw-500 caps">#{tagName} ({count})</span>
            </a>
          </li>
        );
      });

      return (
        <div className="px3">
          <h6 className="gray-1">Bounty Tags</h6>
          <ul className="list-reset mxn2">
            {renderedTags}
          </ul>
        </div>
      );
    }
  },

  renderIntroductionForm() {
    let product = this.state.product;
    let user = UserStore.getUser();

    if (user && !product.is_member) {
      return (
        <div className="mb2">
          <Tile>
            <div className="px3 py2">
              <h5 className="mt0 mb1">Hey {user.username}!</h5>
              <div className="gray-1 h6 markdown markdown-normalized py1 mb2">
                Ready to pitch in on {product.name}? Introduce yourself.
              </div>

              <TypeaheadUserTextArea className="form-control mb2"
                onChange={this.handleIntroductionChange}
                placeholder="What do you like to do? What is your favorite sandwich?"
                rows="2"
                value={this.state.introduction}
                style={{ fontSize: 13 }} />
              <div className="center">
                <Button type="default" action={this.handleIntroductionSubmit}>
                  Introduce yourself!
                </Button>
              </div>
            </div>
          </Tile>
        </div>
      );
    }
  },

  renderProductMarks() {
    let productMarks = this.state.productMarks;

    if (productMarks.length) {
      let renderedTags = productMarks.map((mark, i) => {
        return (
          <li className="mb1 lh0_9" key={mark + '-' + i}>
            <span className="fs1 fw-500 gray-1 caps">{mark}</span>
          </li>
        );
      });

      return (
        <div className="px3">
          <h6 className="gray-1 mt0">Product Tags</h6>
          <ul className="list-reset">
            {renderedTags}
          </ul>
        </div>
      );
    }
  }
});

module.exports = ProductActivity;
