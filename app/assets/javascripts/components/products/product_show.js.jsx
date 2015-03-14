'use strict';

const Avatar = require('../ui/avatar.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const IntroductionForm = require('./introduction_form.js.jsx');
const MetricsBadge = require('./metrics_badge.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductSubsections = require('./product_subsections.js.jsx');
const Routes = require('../../routes');
const Screenshots = require('./screenshots.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const User = require('../user.js.jsx')
const UserStore = require('../../stores/user_store');

let ProductShow = React.createClass({
  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = this.state.product && this.state.product.name;

    ProductStore.addChangeListener(this.onProductChange);

    $.getJSON(`/api/products/${this.state.product.slug}/updates/paged.json`, function(data) {
      this.setState({
        updates: data.posts,
        updateCount: data.meta.count
      })
    }.bind(this))
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      product: this.getProductStateFromStore(),
      updates: []
    }
  },

  getProductStateFromStore() {
    return ProductStore.getProduct()
  },

  onProductChange() {
    this.setState({
      product: this.getProductStateFromStore()
    })
  },

  render() {
    let product = this.state.product;
    let slug = product.slug;
    let user = UserStore.getUser();

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          {this.renderEditButton()}

          <div className="clearfix mxn3">
            <div className="sm-col sm-col-8 px3 mb2 sm-mb0">
              <Tile>

                <Screenshots key="product-screenshots" />

                <div className="clearfix p3 sm-p4">
                  <Markdown content={product.description_html} normalized={true} />

                  <div className="mt3">
                    <ProductSubsections />
                  </div>

                  <hr />

                  <div className="mb4">
                    <h6 className="gray-2 caps mt0 mb2">Core team ({product.core_team.length})</h6>
                    <div className="clearfix mxn1">
                      {product.core_team.map(function(user) {
                        return <div className="left p1" key={user.id} href={user.url}>
                          <User user={user} />
                        </div>
                      })}
                    </div>
                  </div>


                  <div className="mb4">
                    <div className="mb2">
                      <a href={`/${product.slug}/activity`} className="right">More</a>
                      <h6 className="gray-2 caps mt0 mb0">Updates ({this.state.updateCount})
                      </h6>
                    </div>

                    <div className="mxn2">
                      {this.renderUpdates()}
                    </div>
                  </div>
                </div>

              </Tile>
            </div>

            <div className="md-col md-col-4 px3">
              <div className="mb3">
                <Tile>
                  {this.renderCommunityBuiltNotice()}
                  <div className="border-bottom">
                    <div className="p3">
                      <h5 className="mt0 mb1">Build {product.name} with us!</h5>
                      {this.renderIntroductionForm()}
                    </div>
                  </div>

                  <div className="border-bottom">
                    <MetricsBadge />
                  </div>

                  <div className="border-bottom">
                    {this.renderMostActiveUsers()}
                  </div>

                  <a href="/help" className="block px3 py2 center">
                    See how Assembly works
                  </a>
                </Tile>
              </div>

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
          <IntroductionForm product={product} />
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
    );
  },

  renderProductLead() {
    let product = this.state.product;

    return (
      <div className="h6">
        <Markdown content={product.lead} normalize={true} />
      </div>
    );
  },

  renderUpdates() {
    return _.first(this.state.updates, 3).map(function(update) {
      if (update.body) {
        return <a className="block clearfix p2 rounded bg-gray-6-hover" href={update.url} key={update.id}>
          <div className="right mt1 ml2">
            <Avatar user={update.user} size={24} />
          </div>
          <div className="overflow-hidden">
            <h5 className="black mt0 mb0">{update.title}</h5>
            <p className="gray-2 mb0">{truncate(update.body.text, 140)}</p>
          </div>
        </a>
      }
    });
  }
});

module.exports = ProductShow;
