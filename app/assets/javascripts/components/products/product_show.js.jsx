'use strict';

const Avatar = require('../ui/avatar.js.jsx');
const Button = require('../ui/button.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const IntroductionActions = require('../../actions/introduction_actions');
const IntroductionStore = require('../../stores/introduction_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductSubsections = require('./product_subsections.js.jsx');
const Routes = require('../../routes');
const Screenshots = require('./screenshots.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const UserStore = require('../../stores/user_store');

let ProductShow = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = this.state.product && this.state.product.name;

    IntroductionStore.addChangeListener(this.onIntroductionChange);
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    IntroductionStore.removeChangeListener(this.onIntroductionChange);
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  getStateFromStore() {
    return {
      product: ProductStore.getProduct()
    };
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

  onProductChange() {
    this.setState(this.getStateFromStore());
  },

  render() {
    let product = this.state.product;
    let slug = product.slug;
    let user = UserStore.getUser();
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

    let style = {
      importantLinks: {
        borderColor: '#dbdee3'
      }
    };

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          {this.renderEditButton()}

          <div className="clearfix mxn3">
            <div className={leftColumnClasses}>
              <Tile>

                <Screenshots key="product-screenshots" />

                <div className="clearfix p3 sm-p4">
                  <h5 className="mt0 mb2" style={{ fontSize: 16 }}>
                    {product.pitch}
                  </h5>

                  <Markdown content={product.description_html} normalized={true} />

                  <div className="mt4">
                    <ProductSubsections />
                  </div>
                </div>
              </Tile>
            </div>

            <div className={rightColumnClasses}>
              <Tile>
                {this.renderCommunityBuiltNotice()}
                <div className="border-bottom">
                  <div className="p3">
                    <h5 className="mt0 mb1">Build {product.name} with us!</h5>
                    {this.renderIntroductionForm()}
                  </div>
                </div>

                {this.renderMostActiveUsers()}

                <div className="bg-gray-6">
                  <div className="p3 center">
                    <div className="gray-2 mt1">
                      <a href="/help">See how Assembly works</a>
                    </div>
                  </div>
                </div>
              </Tile>

              <ProductImportantLinks product={product} />

            </div>
          </div>
        </div>
      </div>
    );
  },

  renderCommunityBuiltNotice() {
    let product = this.state.product;

    if (product.community_built) {
      return (
        <div className="border-bottom">
          <div className="px3 py2">
            <span className="gray-1">Verified community-built</span>
          </div>
        </div>
      );
    }
  },

  renderEditButton() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      let slug = this.state.product.slug;

      return (
        <div className="py1">
          <a href={Routes.edit_product_path({ id: slug })}
              className="gray-2">
            <Icon icon="pencil" /> Edit product details
          </a>
        </div>
      );
    }
  },

  renderIntroductionForm() {
    let product = this.state.product;
    let user = UserStore.getUser();

    if (user && !product.is_member) {
      return (
        <div className="mt2">
          <div className="gray-1 h6 markdown markdown-normalized py1 mb2">
            Ready to pitch in on {product.name}? Introduce yourself.
          </div>

          <TypeaheadUserTextArea className="form-control mb2"
            onChange={this.handleIntroductionChange}
            placeholder={"What kinds of problems do you like to solve? What skills can you contribute to " +
              product.name + "? Are you a coder, a designer, a marketer, or simply a doer?"}
            rows="2"
            value={this.state.introduction}
            style={{ fontSize: 13 }} />
          <div className="center">
            <Button type="default" action={this.handleIntroductionSubmit}>
              Introduce yourself!
            </Button>
          </div>
        </div>
      );
    }

    return this.renderProductLead();
  },

  renderMostActiveUsers() {
    let product = this.state.product;
    let contributors = product.most_active_contributors;
    let renderedContributors = contributors.map((contributor) => {
      return (
        <span className="left mr1" key={contributor.id}>
          <a href={contributor.url}>
            <Avatar user={contributor} />
          </a>
        </span>
      );
    });

    return (
      <div className="border-bottom">
        <div className="px3 py2">
          <h5 className="mt0 mb2">Most active members</h5>
          <div className="clearfix">
            {renderedContributors}
          </div>
          <div className="gray-3 mt2">
            <a href={Routes.product_people_path({ product_id: product.slug })}
                className="gray-3 underline">
              <small>View all partners</small>
            </a>
          </div>
        </div>
      </div>
    );
  },

  renderProductLead() {
    let product = this.state.product;

    return (
      <div className="h6">
        <Markdown content={product.lead} normalize={true} />
      </div>
    );
  }
});

module.exports = ProductShow;
