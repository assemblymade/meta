'use strict';

const AppIcon = require('../app_icon.js.jsx');
const Button = require('../ui/button.js.jsx');
const CreateProductItem = require('../create_product_item.js.jsx');
const CreateProductItemStore = require('../../stores/create_product_item_store');
const Icon = require('../ui/icon.js.jsx');
const Nav = require('../ui/nav.js.jsx');
const page = require('page');
const ProductFollowers = require('../product_followers.js.jsx');
const ProductHeaderStore = require('../../stores/product_header_store');
const ProductStore = require('../../stores/product_store');
const Routes = require('../../routes');
const url = require('url');
const UserStore = require('../../stores/user_store')
const Label = require('../ui/label.js.jsx')

const ProductHeader = React.createClass({
  componentDidMount() {
    CreateProductItemStore.addChangeListener(this.onActiveMenuItemChange);
    ProductHeaderStore.addChangeListener(this.onProductHeaderChange);
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    CreateProductItemStore.removeChangeListener(this.onActiveMenuItemChange);
    ProductHeaderStore.removeChangeListener(this.onProductHeaderChange);
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      activeMenuItem: CreateProductItemStore.getActiveMenuItem(),
      activeTab: ProductHeaderStore.getActiveTab(),
      product: ProductStore.getProduct()
    };
  },

  isActive(tabName) {
    return this.state.activeTab === tabName
  },

  onActiveMenuItemChange() {
    this.setState({
      activeMenuItem: CreateProductItemStore.getActiveMenuItem()
    });
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct()
    });
  },

  onProductHeaderChange() {
    this.setState({
      activeTab: ProductHeaderStore.getActiveTab()
    });
  },

  render() {
    let product = this.state.product;

    if (!product) {
      return null;
    }

    let createBountyButton = null
    if (UserStore.isSignedIn()) {
      // createBountyButton =
    }

    return (
      <div className="bg-white shadow-light">
        <div className="border-bottom border-gray">
          <div className="container py3">
            <div className="clearfix">
                <a className="block left mr2 sm-mr3" href={product.url} style={{ maxWidth: 60 }}>
                  <AppIcon app={product} size={60} />
                </a>

                <div className="sm-show right py2 ml3">
                  {this.renderTryButton()}
                </div>

                <div className="overflow-hidden">
                  <h2 className="mt0 mb0">
                    <a className="black" href={product.url}>{product.name}</a>
                  </h2>
                  <h4 className="m0 regular gray-2">
                    {product.pitch.substr(0, 60)}
                  </h4>

                  <div className="clearfix">
                    <ul className="left sm-show list-inline px0 mt1 mb0">
                      {this.renderTags()}
                    </ul>
                  </div>
                </div>

            </div>
          </div>
        </div>

        <div className="container">
          <div className="clearfix">

            <div className="sm-right">
              <div className="center sm-right-align py1">
                <ProductFollowers product_id={product.id} />
              </div>
            </div>

            <div className="sm-left">
              <Nav type="tabs">
                <Nav.Item active={this.isActive('overview')} href={product.url} label="Overview" />
                <Nav.Item active={this.isActive('bounties')} href={product.url + '/bounties'} label="Bounties" />
                <Nav.Item active={this.isActive('partners')} href={product.url + '/partners'} label="Partners" />
                <Nav.Item active={this.isActive('activity')} href={product.url + '/activity'} label="Activity" />
                <Nav.Item href={product.url + '/chat'} label="Chat" />
              </Nav>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderProductState() {
    let product = this.state.product;
    let homepageUrl = product.homepage_url;

    let status;
    if (homepageUrl) {
      status = (
        <span className="gray-1">
          <span className="mr1">
            <Icon icon="rocket" />
          </span>
          <h5 className="inline mb0 mt0 gray-1">Live</h5>
        </span>
      );
    } else {
      status = (
        <span className="gray-1">
          <span className="mr1">
            <Icon icon="wrench" />
          </span>
          <h5 className="inline mb0 mt0 gray-1">In development</h5>
        </span>
      );
    }

    return status;
  },

  renderTags() {
    let product = this.state.product;
    let marks = product.labels || [];

    return marks && marks.map((mark, i) => {
      return (
        <li key={mark + '-header-' + i}>
          <Label name={mark} />
        </li>
      );
    });
  },

  renderTryButton() {
    let product = this.state.product;
    let homepageUrl = product.homepage_url;

    if (homepageUrl) {
      let href = url.parse(homepageUrl).href;

      return (
        <Button type="primary" action={function() { window.open(href, '_blank') }}>
          <span className="mr1">
            Try {product.name}
          </span>
          <span className="h6">
            <Icon icon="chevron-right" />
          </span>
        </Button>
      );
    }

    return (
      <Button type="primary">
        In development
      </Button>
    )
  }
});

module.exports = window.ProductHeader = ProductHeader;
