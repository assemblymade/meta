'use strict';

const Avatar = require('../ui/avatar.js.jsx');
const Button = require('../ui/button.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const ProductStore = require('../../stores/product_store');
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
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
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

  onProductChange() {
    this.setState(this.getStateFromStore());
  },

  render() {
    let product = this.state.product;
    let slug = product.slug;
    let user = UserStore.getUser();
    let leftColumnClasses = React.addons.classSet({
      col: true,
      'col-9': true,
      'mx-auto': true,
      'px4': true
    });

    let rightColumnClasses = React.addons.classSet({
      'col': true,
      'col-3': true,
      'px2': true
    });

    let style = {
      importantLinks: {
        borderColor: '#dbdee3'
      }
    };

    return (
      <div>
        <ProductHeader product={product} />

        <div className="clearfix px4">
          <div className={leftColumnClasses}>
            <div className="left mb2">
              <a href={Routes.edit_product_path({ id: slug })}
                  className="gray-2">
                <Icon icon="pencil" /> Edit product details
              </a>
            </div>
          </div>
        </div>

        <div className="clearfix px4">
          <div className={leftColumnClasses}>
            <Tile>

              <Screenshots key="product-screenshots" />

              <div className="clearfix p4">
                <h5 className="mt0 mb2" style={{ fontSize: 16 }}>
                  {product.pitch}
                </h5>

                <p className="gray-1" style={{ fontSize: 16, lineHeight: '2.3rem' }} dangerouslySetInnerHTML={{ __html: product.description_html }} />

                {this.renderSubsections()}
              </div>
            </Tile>
          </div>

          <div className={rightColumnClasses}>
            <Tile>
              {this.renderCommunityBuiltNotice()}
              <div className="border-bottom">
                <div className="px3 py2">
                  <h5 className="mt0 mb1">Build {product.name} with us!</h5>
                  <span className="gray-1" dangerouslySetInnerHTML={{ __html: product.lead }} />
                </div>
              </div>

              {this.renderMostActiveUsers()}

              <div className="bg-gray-6">
                <div className="p3 center">
                  <a href={Routes.product_wips_path({ product_id: slug })}
                      className="block">
                    <Button type="default" action={function() {}}>
                      Build with us
                    </Button>
                  </a>

                  <div className="gray-2 py1">
                    or <a href="/help">See how Assembly works</a>
                  </div>
                </div>
              </div>
            </Tile>

            <div className="border-bottom mt3" style={style.importantLinks}>
              <h5>Important links</h5>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="comment" />
              </span>
              <a href={Routes.product_chat_path({ product_id: slug })}
                  className="bold">
                Say hi in chat
              </a>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="warning" />
              </span>
              <a href={Routes.product_wips_path({ product_id: slug })}
                  className="bold">
                File a bug
              </a>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="question-circle" />
              </span>
              <a href={Routes.product_posts_path({ product_id: slug })}
                  className="bold">
                Ask a question
              </a>
            </div>

            <div className="py2">
              <span className="mr1 gray-2">
                <Icon icon="code" />
              </span>
              <a href={Routes.product_repos_path({ product_id: slug })}
                  className="bold">
                Source code
              </a>
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
          <h6 className="mt0 mb1">Most active members</h6>
          <div className="clearfix">
            {renderedContributors}
          </div>
        </div>
      </div>
    );
  },

  renderSubsections() {
    // still figuring out the design/UX for creating and editing these
    // subsections
    return null;

    let product = this.state.product;
    let subsections = product.subsections;
    let headings = Object.keys(subsections);

    let renderedSubsections = [];

    for (let i = 0, l = headings.length; i < l; i += 2) {
      let leftHeading = headings[i];
      let rightHeading = headings[i + 1];
      let leftBody = subsections[leftHeading];
      let rightBody = subsections[rightHeading];

      let renderedLeft = _subsection(leftHeading, leftBody);

      let renderedRight;
      if (rightHeading) {
        renderedRight = _subsection(rightHeading, rightBody);
      }

      renderedSubsections.push(
        <div className="clearfix py1">
          {renderedLeft}
          {renderedRight}
        </div>
      );
    }

    return renderedSubsections;
  }
});

function _subsection(heading, body) {
  return (
    <div className="col col-6" style={{ paddingRight: '4rem' }}>
      <h6 className="mt0 mb0">{heading}</h6>
      <p className="gray-1">
        {body}
      </p>
    </div>
  );
}

module.exports = ProductShow;
