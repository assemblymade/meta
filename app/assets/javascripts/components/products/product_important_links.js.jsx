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
    let style = {
      borderColor: '#dbdee3'
    };

    return (
      <div>
        <div className="border-bottom mt3" style={style}>
          <h5>Important links</h5>
        </div>

        {this.renderHomepageUrl()}

        <div className="border-bottom py2" style={style}>
          <span className="mr3 gray-2">
            <Icon icon="comment" />
          </span>
          <a href={Routes.product_chat_path({ product_id: slug })}>
            Say hi in chat
          </a>
        </div>

        <div className="border-bottom py2" style={style}>
          <span className="mr3 gray-2">
            <Icon icon="warning" />
          </span>
          <a href={Routes.product_wips_path({
                params: {
                  product_id: slug
                },
                data: {
                  modal: true,
                  tags: 'bug'
                }
              })}>
            File a bug
          </a>
        </div>

        <div className="border-bottom py2" style={style}>
          <span className="mr3 gray-2">
            <Icon icon="question-circle" />
          </span>
          <a href={Routes.product_posts_path({ product_id: slug })}>
            Ask a question
          </a>
        </div>

        <div className="py2">
          <span className="mr3 gray-2">
            <Icon icon="code" />
          </span>
          <a href={Routes.product_repos_path({ product_id: slug })}>
            Source code
          </a>
        </div>

        <div className="py2">
          <span className="mr3 gray-2">
            <Icon icon="photo" />
          </span>
          <a href={Routes.product_assets_path({ product_id: slug })}>
            Assets
          </a>
        </div>
      </div>
    );
  },

  renderHomepageUrl() {
    let product = this.props.product;
    let style = {
      borderColor: '#dbdee3'
    };

    if (product.homepage_url) {
      return (
        <div className="border-bottom py2" style={style}>
          <span className="mr3 gray-2">
            <Icon icon="home" />
          </span>
          <a href={product.homepage_url}>
            Home
          </a>
        </div>
      );
    }
  }
});

module.exports = ProductImportantLinks;
