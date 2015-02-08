'use strict';

const DraggingMixin = require('../../mixins/dragging_mixin');
const Dropzone = window.Dropzone;
const ProductStore = require('../../stores/product_store');
const ScreenshotActions = require('../../actions/screenshot_actions');
const ScreenshotStore = require('../../stores/screenshot_store');
const Routes = require('../../routes');

let ProductScreenshotPlaceholder = React.createClass({
  mixins: [DraggingMixin],

  propTypes: {
    size: React.PropTypes.oneOf(['small', 'large'])
  },

  componentDidMount() {
    let attachmentUploadUrlTag = $('meta[name=attachment-upload-url]');
    let clickable = this.refs.clickable;
    let url = Routes.product_screenshots_path({
      product_id: ProductStore.getSlug()
    });

    this.dropzone = new Dropzone(this.getDOMNode(), {
      accept: ScreenshotActions.uploadScreenshot(url),
      clickable: clickable && clickable.getDOMNode(),
      sending: this.onSending,
      success: ScreenshotActions.handleSuccess,
      url: attachmentUploadUrlTag && attachmentUploadUrlTag.attr('content')
    });

    ScreenshotStore.addChangeListener(this.onScreenshotChange);

    this.setState({
      height: window.getComputedStyle(clickable && clickable.getDOMNode()).height
    });
  },

  componentWillUnmount() {
    this.dropzone = null;
    ScreenshotStore.removeChangeListener(this.onScreenshotChange);
  },

  getDefaultProps() {
    return {
      size: 'large'
    };
  },

  getInitialState() {
    return {
      text: this.props.size === 'large' ?
        "Drag and drop an image here. 1024 x 768 pixels works best." : "+"
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
    let large = this.props.size === 'large';

    let style = {
      container: {
        borderRadius: 4
      },

      placeholder: {
        backgroundColor: this.state.dragging ? '#c7c7c7' : '#ededed',
        border: '1px dashed #d3d3d3',
        cursor: 'pointer',
        maxHeight: large ? 400 : 100,
        minHeight: large ? 80 : 0,
        height: large ? (this.state.height || 80) : '100%',
        width: large ? '100%' : 100
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
