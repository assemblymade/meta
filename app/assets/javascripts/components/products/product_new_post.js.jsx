'use strict';

const FormGroup = require('../form_group.js.jsx');
const NewPostForm = require('../posts/new_post_form.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const UserStore = require('../../stores/user_store');

let ProductNewPost = React.createClass({
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
    document.title = 'New Post · ' + this.state.product.name;

    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      product: ProductStore.getProduct()
    };
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct()
    });
  },

  render() {
    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <h1 className="mt0">Publish a new post</h1>

          <div className="clearfix mxn2">

            <div className="col col-9 px2">
              <NewPostForm />
            </div>

            <div className="col col-3 px2">
              <div className="h6 mt0 mb0 gray-2">
                <p>
                  Posts are a great way to keep new contributors up to date with
                  progress and new ways to help out. You can include images and
                  use Markdown to make it more awesome.
                </p>

                {this.renderAnnouncementWarning()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderAnnouncementWarning() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      let product = this.state.product;

      return [
        <p key={product.name + '-post-warning'}>
          You're on the core team, so everyone following {product.name} will get an email with your post.
        </p>,

        <a className="btn btn-default btn-block"
            id="preview-post-btn"
            href={'/' + product.slug + '/posts/preview'}
            onClick={this.handlePreviewClick}
            key={product.name + '-post-preview'}>
          Preview email
        </a>
      ];
    }
  }
});

module.exports = ProductNewPost;
