'use strict';

const Carousel = require('../ui/carousel.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const Routes = require('../../routes');
const ScreenshotActions = require('../../actions/screenshot_actions');
const ScreenshotsStore = require('../../stores/screenshots_store');
const UserStore = require('../../stores/user_store');
const Video = require('./video.js.jsx');

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

  handleDeleteClick(href, e) {
    e && e.preventDefault();

    if (window.confirm('Are you sure you want to delete this asset?')) {
      ScreenshotActions.deleteScreenshot(href);
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
          maxWidth: 100,
          width: 100
        }
      };

      if (isCore) {
        let href = Routes.product_asset_path({
          product_id: ProductStore.getSlug(),
          id: screenshot.asset_id
        });

        let screenshotUrl = screenshot.url;

        if (screenshot.video_id) {
          return <Video videoId={screenshot.video_id} key={screenshot.id} />;
        }

        return (
          <div className="mb1 hover-toggle-wrapper relative"
              style={style.div}
              key={screenshot.id}>
            <span className="hover-toggle-target absolute clickable"
                style={style.anchor}
                onClick={this.handleDeleteClick.bind(this, href)}
                key={`delete-${screenshot.id}`}>
              <Icon icon="close" />
            </span>
            <img className="inline" src={screenshotUrl} />
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
      return images;
    }
  }
});

module.exports = Screenshots;
