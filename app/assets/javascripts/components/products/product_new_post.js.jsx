'use strict';

const FormGroup = require('../form_group.js.jsx');
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
    let csrfTokenElement = document.getElementsByName('csrf-token')[0];

    return {
      csrf: csrfTokenElement && csrfTokenElement.content,
      error: null,
      title: '',
      product: ProductStore.getProduct()
    };
  },

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  },

  handlePreviewClick(e) {
    e.preventDefault();
    let btn = $("#preview-post-btn"),
        msg = btn.text();
    $.post(btn.attr('href'), $('#new_post').serialize());
    btn.text('Sent!');
    delay(3000, function() { btn.text(msg); });
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct()
    });
  },

  render() {
    let csrf = this.state.csrf;
    let product = this.state.product;

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <h1 className="mt0">Publish a new post</h1>

          <div className="clearfix mxn2">

            <form id="new_post" action={'/' + product.slug + '/posts'} method="post">
              <input name="authenticity_token" type="hidden" value={csrf} />

              <div className="col col-9 px2">
                <FormGroup error={this.state.error}>
                  <label for="post_title" className="control-label">Title</label>
                  <input className="form-control"
                      type="text"
                      name="post[title]"
                      id="post_title"
                      value={this.state.title}
                      onChange={this.handleTitleChange} />
                </FormGroup>

                <FormGroup error={this.state.error}>
                  <label class="control-label" for="post_body">Body</label>
                  <MarkdownEditor name="post[body]" id="post_body" />
                </FormGroup>

                <div className="form-actions">
                  <input type="submit" className="btn btn-primary" value="Submit" />
                </div>
              </div>
            </form>

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
        <p>
          You're on the core team, so everyone following {product.name} will get an email with your post.
        </p>,

        <a className="btn btn-default btn-block"
            id="preview-post-btn"
            href={'/' + product.slug + '/posts/preview'}
            onClick={this.handlePreviewClick}>
          Preview email
        </a>
      ];
    }
  }
});

module.exports = ProductNewPost;
