'use strict';

const AppIcon = require('../app_icon.js.jsx');
const Button = require('../ui/button.js.jsx');
const CreateProductItem = require('../create_product_item.js.jsx');
const CreateProductItemStore = require('../../stores/create_product_item_store');
const Icon = require('../ui/icon.js.jsx');
const page = require('page');
const ProductFollowers = require('../product_followers.js.jsx');
const ProductHeaderStore = require('../../stores/product_header_store');
const ProductStore = require('../../stores/product_store');
const Routes = require('../../routes');
const url = require('url');

let ProductHeader = React.createClass({
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
    return React.addons.classSet({
      mr3: true,
      active: this.state.activeTab === tabName
    });
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

    let navStyle = {
      paddingLeft: '0 !important',
      paddingRight: '0 !important'
    };

    return (
      <div className="bg-white shadow-light">
        <div className="border-bottom border-gray">
          <div className="container py3">
            <div className="">
              <div className="left">
                <a className="block left mr3" href={product.url} style={{ maxWidth: 96 }}>
                  <AppIcon app={product} size={96} />
                </a>

                <div className="inline-block">
                  <h2 className="mt0 mb1 ml0">
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

              <div className="sm-right-align sm-py3 center">
                {this.renderTryButton()}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="clearfix">
            <div className="left px1">
              <ul className="nav nav-tabs">
                <li className={this.isActive('overview')}>
                  <a style={navStyle} href={product.url}>Overview</a>
                </li>

                <li className={this.isActive('activity')}>
                  <a style={navStyle} href={product.url + '/activity'}>Activity</a>
                </li>

                <li className={this.isActive('bounties')}>
                  <a style={navStyle} href={product.url + '/bounties'}>Bounties</a>
                </li>

                <li>
                  <a style={navStyle} href={product.url + '/chat'}>Chat</a>
                </li>
              </ul>
            </div>

            <div className="clearfix">
              <div className="center sm-right-align py1">
                <span className="h6 mr3">
                  <ProductFollowers product_id={product.id} />
                </span>
                <CreateProductItem product={product} activeMenuItem={this.state.activeMenuItem} />
              </div>
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
    let marks = product.top_marks;

    return marks && marks.slice(0, 3).map((mark, i) => {
      return (
        <li className="gray-2" key={mark + '-header-' + i}>
          <small>#{mark.toUpperCase()}</small>
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
