'use strict';

const Carousel = require('../ui/carousel.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const ScreenshotsStore = require('../../stores/screenshots_store');
const UserStore = require('../../stores/user_store');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

let Screenshots = React.createClass({
  componentDidMount() {
    ScreenshotsStore.addChangeListener(this.onScreenshotsChange);
  },

  componentWillUnmount() {
    ScreenshotsStore.removeChangeListener(this.onScreenshotsChange);
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  getStateFromStore() {
    return {
      screenshots: ScreenshotsStore.getScreenshots()
    };
  },

  onScreenshotsChange() {
    this.setState(this.getStateFromStore());
  },

  render() {
    let images = this.wrapScreenshots() || [];

    if (images.length) {
      return <Carousel images={images} />;
    }

    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      return <ProductScreenshotPlaceholder />;
    }
  },

  wrapScreenshots() {
    let screenshots = this.state.screenshots;
    let style = {
      borderRadius: 4,
      maxWidth: 100,
      width: 100
    };
    let images;

    if (screenshots.length) {
      images = screenshots.
        map((screenshot) => {
          return <img className="mb1" src={screenshot.url} style={style} key={screenshot.id} />;
      });

      if (ProductStore.isCoreTeam(UserStore.getUser())) {
        images.push(
          <ProductScreenshotPlaceholder size="small" key={'placeholder-' + images.length} />
        );
      }

      return images;
    }
  }
});

module.exports = Screenshots;
