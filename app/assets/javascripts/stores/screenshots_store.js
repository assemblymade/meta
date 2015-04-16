'use strict';

/**
 * This store is for multiple screenshots
 */

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const { List } = require('immutable');
const ProductStore = require('./product_store');
const Store = require('./es6_store');

const assetIdMatches = (id) => {
  return (screenshot) => {
    return screenshot.asset_id === id;
  };
};

let screenshots = List();

class ScreenshotsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.SCREENSHOT_DELETED:
          screenshots = screenshots.filterNot(assetIdMatches(action.id));
          break;
        case ActionTypes.SCREENSHOTS_RECEIVE:
          screenshots = List(action.screenshots);
          break;
        case ActionTypes.SCREENSHOT_SUCCESS:
          break;
        case ActionTypes.SCREENSHOT_UPLOADED:
          screenshots = screenshots.push(action.screenshot);
          // no need to emit a change event
          return;
        default:
          return;
      }

      this.emitChange();
    });
  }

  getScreenshots() {
    if (ProductStore.getVideoId()) {
      return screenshots.unshift({
        video_id: ProductStore.getVideoId(),
        id: `video_${ProductStore.getId()}`
      }).toJS();
    }

    return screenshots.toJS();
  }
};

module.exports = new ScreenshotsStore();
