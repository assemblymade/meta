var AppIcon = require('../app_icon.js.jsx');
var Button = require('../ui/button.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var Pill = require('../ui/pill.js.jsx');
var ProductFollowers = require('../product_followers.js.jsx');
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
      <div className="bg-white shadow-light tranx_m md-mb3">
        <div className="border-bottom border-gray">
          <div className="px4">
            <div className="block px4 full-width pb2 r768_table r600_pb0">
              <div className="primary block full-width center py2 valign-mid r768_table-cell r768_left-align">
                <div className="app-icon-container center valign-top r768_table-cell r768_pr4">
                  <a className="block mx-auto mb2 sm-mb0" href={product.url} style={{ maxWidth: 96 }}>
                    <AppIcon app={product} size={96} />
                  </a>
                </div>
                <div className="block valign-top r768_table-cell">
                  <h2 className="mt0 mb1">
                    <a className="black" href={product.url}>{product.name}</a>
                  </h2>
                  <h4 className="p0 m0 regular gray-2">
                    {product.pitch.substr(0, 60)}
                  </h4>
                  <ul className="list-inline px0 py1">
                    {this.renderProductState()}
                    {this.renderTags()}
                  </ul>
                </div>
              </div>

              <div className="mcenter center valign-mid r768_table-cell r768_right-align"
                  style={{ width: 300 }}>
                {this.renderHomepageLink()}
              </div>
            </div>
          </div>
        </div>

        <div className="clearfix px4">
          <div className="left px4">
            <ul className="nav nav-tabs" style={{ textAlign: 'left' }}>
              <li>
                <a href={product.url}>Overview</a>
              </li>

              <li>
                <a href={product.url + '/activity'}>Activity</a>
              </li>
            </ul>
          </div>

          <div className="right py1 px2">
            <ProductFollowers product_id={product.id} />
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
        <a href={homepageUrl}>
          <Button type="primary" action={function() {}}>
            <span className="mr2">{encodeURI(url.parse(homepageUrl).hostname)}</span>
            <Icon icon="share" />
          </Button>
        </a>
      );
    }
  },

  renderProductState() {
    var product = this.props.product;
    var homepageUrl = product.homepage_url;

    var pill = homepageUrl ?
      <Pill>In development</Pill> :
      <Pill>In development</Pill>;

    return (
      <li>
        {pill}
      </li>
    );
  },

  renderTags() {
    var product = this.props.product;
    var marks = product.top_marks;

    return marks && marks.map((mark) => {
      return (
        <li className="gray-2">
          #{mark}
        </li>
      );
    });
  }
});

module.exports = ProductHeader;
