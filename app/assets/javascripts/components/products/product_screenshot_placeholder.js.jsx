'use strict';

const DraggingMixin = require('../../mixins/dragging_mixin');
const Dropzone = window.Dropzone;
const ProductStore = require('../../stores/product_store');
const ProductScreenshotActions = require('../../actions/product_screenshot_actions');
const ProductScreenshotStore = require('../../stores/product_screenshot_store');
const Routes = require('../../routes');

let ProductScreenshotPlaceholder = React.createClass({
  mixins: [DraggingMixin],

  componentDidMount() {
    let attachmentUploadUrlTag = $('meta[name=attachment-upload-url]');
    let clickable = this.refs.clickable;
    let url = Routes.product_screenshots_path({
      product_id: ProductStore.getSlug()
    });

    this.dropzone = new Dropzone(this.getDOMNode(), {
      accept: ProductScreenshotActions.uploadScreenshot(url),
      clickable: clickable && clickable.getDOMNode(),
      sending: this.onSending,
      url: attachmentUploadUrlTag && attachmentUploadUrlTag.attr('content')
    });

    ProductScreenshotStore.addChangeListener(this.onScreenshotChange);

    this.setState({
      height: window.getComputedStyle(clickable && clickable.getDOMNode()).height
    });
  },

  componentWillUnmount() {
    this.dropzone = null;
    ProductScreenshotStore.removeChangeListener(this.onScreenshotChange);
  },

  getInitialState() {
    return {
      text: "+"
    };
  },

  handleClick(e) {
    e.stopPropagation();
  },

  onScreenshotChange() {},

  onSending(file, xhr, formData) {
    _.each(file.form, function(v, k) {
      formData.append(k, v);
    });
  },

  render() {
    let style = {
      container: {
        borderRadius: 4
      },

      placeholder: {
        backgroundColor: this.state.dragging ? '#c7c7c7' : '#ededed',
        border: '1px dashed #d3d3d3',
        cursor: 'pointer',
        maxHeight: 400,
        minHeight: 80,
        height: this.state.height || 80,
        width: '100%'
      },

      text: {
        margin: 'auto',
        position: 'relative',
        textAlign: 'center',
        top: '40%'
      }
    };

    return (
      <div style={style.container}>
        <div style={style.container}>
          <div style={style.placeholder} ref="clickable" onClick={this.handleClick}>
            <div className="gray-1" style={style.text}>
              {this.state.text}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProductScreenshotPlaceholder;
