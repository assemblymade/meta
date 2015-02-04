var AppIcon = require('../app_icon.js.jsx');
var Button = require('../ui/button.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var Pill = require('../ui/pill.js.jsx');
var ProductFollowers = require('../product_followers.js.jsx');
var Routes = require('../../routes');
var url = require('url');

var ProductHeader = React.createClass({
  propTypes: {
    product: React.PropTypes.shape({
      can_update: React.PropTypes.bool,
      homepage_url: React.PropTypes.string,
      id: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      pitch: React.PropTypes.string.isRequired,
      slug: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired
    }).isRequired
  },

  render() {
    var product = this.props.product;

    return (
      <div className="bg-white shadow-light">
        <div className="border-bottom border-gray">
          <div className="container py3">
            <div className="">
              <div className="left">
                <a className="block left mr3" href={product.url} style={{ maxWidth: 96 }}>
                  <AppIcon app={product} size={96} />
                </a>

                <div className="overflow-hidden">
                  <h2 className="mt0 mb1 ml0">
                    <a className="black" href={product.url}>{product.name}</a>
                  </h2>
                  <h4 className="m0 regular gray-2">
                    {product.pitch.substr(0, 60)}
                  </h4>
                  <ul className="list-inline px0 mt1 mb0">
                    {this.renderProductState()}
                    {this.renderTags()}
                  </ul>
                </div>
              </div>

              <div className="right mt4">
                {this.renderHomepageLink()}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="clearfix">
            <div className="left">
              <ul className="nav nav-tabs" style={{ textAlign: 'left' }}>
                <li>
                  <a href={product.url}>Overview</a>
                </li>

                <li>
                  <a href={product.url + '/activity'}>Activity</a>
                </li>

                <li>
                  <a href={product.url + '/bounties'}>Participate</a>
                </li>
              </ul>
            </div>

            <div className="right py1">
              <ProductFollowers product_id={product.id} />
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderHomepageLink() {
    var product = this.props.product;
    var homepageUrl = product.homepage_url;

    if (homepageUrl) {
      return (
        <Button type="primary" action={function() {}}>
          <a href={url.parse(homepageUrl).href}
              className="mr2 white">
            {encodeURI(url.parse(homepageUrl).hostname)}
          </a>
          <Icon icon="share" />
        </Button>
      );
    }
  },

  renderProductState() {
    var product = this.props.product;
    var homepageUrl = product.homepage_url;

    var pill;
    if (homepageUrl) {
      pill = (
        <span className="gray-1">
          <span className="mr1">
            <Icon icon="rocket" />
          </span>
          <h6 className="inline mb0 mt0 gray-1">Launched</h6>
        </span>
      );
    } else {
      pill = (
        <span className="gray-1">
          <span className="mr1">
            <Icon icon="wrench" />
          </span>
          <h6 className="inline mb0 mt0 gray-1">In development</h6>
        </span>
      );
    }


    return (
      <li>
        {pill}
      </li>
    );
  },

  renderTags() {
    var product = this.props.product;
    var marks = product.top_marks;

    return marks && marks.slice(0, 3).map((mark) => {
      return (
        <li className="gray-2">
          #{mark}
        </li>
      );
    });
  }
});

module.exports = ProductHeader;
