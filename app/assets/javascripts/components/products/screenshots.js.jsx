'use strict';

const Carousel = require('../ui/carousel.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const Routes = require('../../routes');
const ScreenshotActions = require('../../actions/screenshot_actions');
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

  handleDeleteClick(e) {
    e.preventDefault();

    if (window.confirm('Are you sure you want to delete this asset?')) {
      let url = e.currentTarget.href;

      ScreenshotActions.deleteScreenshot(url);
    }
  },

  onScreenshotsChange() {
    this.setState(this.getStateFromStore());
  },

  render() {
    let images = this.wrapScreenshots() || [];
    let isCore = ProductStore.isCoreTeam(UserStore.getUser()) || UserStore.isStaff();

    if (images.length) {
      return <Carousel images={images} />;
    }

    if (isCore) {
      return <ProductScreenshotPlaceholder />;
    }

    return null;
  },

  wrapScreenshot(isCore) {
    return (screenshot) => {
      let style = {
        anchor: {
          right: '1%',
          color: 'gray'
        },
        div: {
          borderRadius: 4,
          height: 600,
          maxWidth: 100,
          width: 100
        }
      };

      if (isCore) {
        let href = Routes.product_asset_path({
          product_id: ProductStore.getSlug(),
          id: screenshot.asset_id
        });

        return (
          <div className="mb1 hover-toggle-wrapper relative" style={style.div} key={screenshot.id}>
            <a href={href} className="hover-toggle-target absolute" style={style.anchor} onClick={this.handleDeleteClick}>
              <Icon icon="close" />
            </a>
            <img className="inline" src={screenshot.url} />
          </div>
        );
      }

      return <div className="mb1" style={style} key={screenshot.id} />;
    }
  },

  wrapScreenshots() {
    let isCore = ProductStore.isCoreTeam(UserStore.getUser()) || UserStore.isStaff();
    let screenshots = this.state.screenshots;
    let images;

    if (screenshots.length) {
      images = screenshots.map(this.wrapScreenshot(isCore));

      if (isCore) {
        images.push(
          <ProductScreenshotPlaceholder size="small" key={'placeholder-' + images.length} />
        );
      }

      return images;
    }
  }
});

module.exports = Screenshots;
