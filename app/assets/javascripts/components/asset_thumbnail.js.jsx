var CommentActionCreators = require('../actions/comment_action_creators');
var CommentAttachmentStore = require('../stores/comment_attachment_store')

var AssetThumbnail = React.createClass({
  propTypes: {
    preview: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    name: React.PropTypes.string
  },

  checkForErrors: function() {
    var errors = CommentAttachmentStore.getErrors(this.props.url);

    if (errors.length) {
      return this.setState({
        error: errors[0]
      });
    }

    this.setState({
      error: null
    });
  },

  componentDidMount: function() {
    CommentAttachmentStore.addChangeListener(this.checkForErrors);
  },

  getInitialState: function() {
    var product = window.app.currentAnalyticsProduct();

    return {
      error: null,
      ext: this.props.url.split('.').pop(),
      productSlug: product && product.attributes.product_slug,
      showLightbox: false,
      uploaded: CommentAttachmentStore.attachmentBelongsToProduct(this.props.url)
    }
  },

  handleClick: function() {
    this.setState({ showLightbox: true });
  },

  handleHidden: function() {
    this.setState({ showLightbox: false });
  },

  handleUpload: _.debounce(function() {
    var productSlug = this.state.productSlug;

    if (productSlug) {
      CommentActionCreators.uploadAttachment(productSlug, this.props.url);

      this.setState({
        uploaded: true
      });
    }
  }, 500),

  imageAsset: function() {
    var ext = this.state.ext;

    return ['pdf', 'psd'].indexOf(ext) === -1;
  },

  render: function() {
    var lightbox = null;

    if (this.imageAsset() && this.state.showLightbox) {
      lightbox = <ImageLightbox src={this.props.url} name={this.props.name} onHidden={this.handleHidden} />
    }

    return <div className="clickable">
      <img src={this.props.preview} alt={this.props.name} className="img-rounded" onClick={this.handleClick} />
      <div>
        <a onClick={this.handleClick} href={this.props.url} target="_blank" className="text-small">
          {this.props.name} <span className="glyphicon glyphicon-new-window text-muted" />
        </a>
        {this.renderUploadButton()}
      </div>
      {lightbox}
    </div>
  },

  renderUploadButton: function() {
    // if there is no name, the image hasn't been uploaded
    // as an attachment yet. We'll need to find a robust workaround
    // for this case -- simply trying to pull the attachment down
    // from the provided URL could fail if that image no longer exists
    if (!this.props.name && this.imageAsset()) {
      return null;
    }

    if (!this.state.productSlug) {
      return null;
    }

    var classes = React.addons.classSet({
      bold: true,
      small: true,
      ml2: true,
      'text-success': this.state.uploaded,
      'text-danger': this.state.error
    });

    if (this.state.error) {
      return (
        <a className={classes} href="javascript:void(0);" alt="Upload as asset" onClick={this.handleUpload}>
          Asset failed to upload &mdash; try again?
        </a>
      );
    }

    if (this.state.uploaded) {
      return <span className={classes}>Saved to assets</span>;
    }

    return (
      <a className={classes} href="javascript:void(0);" alt="Upload as asset" onClick={this.handleUpload}>
        Save to product assets
      </a>
    );
  }
});

var ImageLightbox = React.createClass({
  componentDidMount: function() {
    $(this.getDOMNode()).modal('show').on('hidden.bs.modal', this.props.onHidden)
  },

  render: function() {
    return <Lightbox ref="lightbox" footer={this.footer()} size="modal-lg">
      <img src={this.props.src} name={this.props.name} />
    </Lightbox>
  },

  footer: function() {
    return <a href={this.props.src} target="_blank">
      {this.props.name} <span className="glyphicon glyphicon-new-window text-muted" />
    </a>
  }
})

if (typeof module !== 'undefined') {
  module.exports = AssetThumbnail
}

window.AssetThumbnail = AssetThumbnail
