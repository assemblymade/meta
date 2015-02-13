'use strict';

const Icon = require('../ui/icon.js.jsx');
const Routes = require('../../routes')

let ProductImportantLinks = React.createClass({
  propTypes: {
    product: React.PropTypes.shape({
      slug: React.PropTypes.string.isRequired
    }).isRequired
  },

  render() {
    let product = this.props.product;
    let slug = product.slug;

    return (
      <div>
        <div className="border-bottom border-gray-4 mt3">
          <h5>Important links</h5>
        </div>

        {this.renderHomepageUrl()}

        <a className="block border-bottom border-gray-4 py2" href={Routes.product_chat_path({ product_id: slug })}>
          <span className="mr3 gray-2">
            <Icon icon="comments" />
          </span>
          Chat
        </a>

        <a className="block border-bottom border-gray-4 py2" href={Routes.product_wips_path({
              params: {
                product_id: slug
              },
              data: {
                modal: true,
                tags: 'bug'
              }
            })}>
          <span className="mr3 gray-2">
            <Icon icon="warning" />
          </span>
          File a bug
        </a>

        <a className="block border-bottom border-gray-4 py2" href={Routes.product_posts_path({
            params: {
              product_id: slug
            },
            data: {
              modal: true,
              tags: 'question'
            }
        })}>
          <span className="mr3 gray-2">
            <Icon icon="question-circle" />
          </span>
          Ask a question
        </a>

        <a className="block border-bottom border-gray-4 py2" href={Routes.product_repos_path({ product_id: slug })}>
          <span className="mr3 gray-2">
            <Icon icon="code" />
          </span>
          Source code
        </a>

        <a className="block border-bottom border-gray-4 py2" href={Routes.product_assets_path({ product_id: slug })}>
          <span className="mr3 gray-2">
            <Icon icon="photo" />
          </span>
          Assets
        </a>

        <a className="block py2" href={Routes.product_financials_path({product_id: slug })}>
          <span className="mr3 gray-2">
            <Icon icon="bar-chart" />
          </span>
          Financials
        </a>

      </div>
    );
  },

  renderHomepageUrl() {
    let product = this.props.product;

    if (product.homepage_url) {
      return (
        <a className="block border-bottom border-gray-4 py2"  href={product.homepage_url}>
          <span className="mr3 gray-2">
            <Icon icon="home" />
          </span>
          Home
        </a>
      );
    }
  }
});

module.exports = ProductImportantLinks;
