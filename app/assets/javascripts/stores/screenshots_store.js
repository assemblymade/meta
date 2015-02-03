'use strict';

/**
 * This store is for multiple screenshots
 */

const ActionTypes = window.CONSTANTS.ActionTypes;
const Dispatcher = window.Dispatcher;
const Store = require('./es6_store');

let screenshots = [];

class ScreenshotsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.SCREENSHOTS_RECEIVE:
          screenshots = action.screenshots;
          this.emitChange();
          break;
        case ActionTypes.SCREENSHOT_SUCCESS:
          this.emitChange();
          break;
        case ActionTypes.SCREENSHOT_UPLOADED:
          screenshots.push(action.screenshot);
          break;
        default:
          break;
      }
    });
  }

  getScreenshots() {
    return screenshots || [];
  }
};

module.exports = new ScreenshotsStore();
