'use strict';

const FormGroup = require('../form_group.js.jsx');
const ProductStore = require('../../stores/product_store');
const qs = require('qs');
const url = require('url');
const UserStore = require('../../stores/user_store');

let NewPostForm = React.createClass({
  componentDidMount() {
    window.analytics.track('product.wip.showed_post_modal', { product: this.state.product.slug });
  },

  getInitialState() {
    let csrfTokenElement = document.getElementsByName('csrf-token')[0];

    return {
      csrf: csrfTokenElement && csrfTokenElement.content,
      error: null,
      title: '',
      product: ProductStore.getProduct()
    }
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

  prefilledTags() {
    var tags = (qs.parse(
      url.parse(
        window.location.toString()
      ).query
    ) || {}).tags;

    if (tags) {
      return tags.split(',');
    }
  },

  render() {
    let csrf = this.state.csrf;
    let product = this.state.product;

    return (
      <form id="new_post" action={'/' + product.slug + '/posts'} method="post">
        <div className="hide">
          <input name="authenticity_token" type="hidden" value={csrf} />
          <select type="hidden" id="tag-list-hack" name="post[mark_names][]" multiple="true" />
        </div>

        <div className="px2">
          <FormGroup error={this.state.error}>
            <label className="control-label">Title</label>
            <input className="form-control"
                type="text"
                name="post[title]"
                id="post_title"
                value={this.state.title}
                onChange={this.handleTitleChange} />
          </FormGroup>

          <FormGroup error={this.state.error}>
            <label className="control-label">Body</label>
            <MarkdownEditor name="post[body]" id="post_body" />
          </FormGroup>

          <h6>Tags</h6>
          <TagList destination={true} newBounty={true} tags={this.prefilledTags()} />

          <TextInput width="125px" size="small" label="Add tag" prepend="#" prompt="Add" />

          <h6>Suggested tags</h6>
          <TagList tags={window.app.suggestedTags()} destination={false} />

          <div className="form-actions">
            <div className="btn-group">
              {this.renderPreviewButton()}
              <input type="submit" className="btn btn-primary" value="Submit" />
            </div>
          </div>
        </div>
      </form>
    );
  },

  renderPreviewButton() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      let product = this.state.product;

      return (
        <a className="btn btn-default"
            id="preview-post-btn"
            href={'/' + product.slug + '/posts/preview'}
            onClick={this.handlePreviewClick}
            key={product.name + '-post-preview'}>
          Preview email
        </a>
      );
    }
  }
});

module.exports = NewPostForm;
