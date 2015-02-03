'use strict';

/**
 * This store is for (uploading) a single screenshot
 */

const ActionTypes = window.CONSTANTS.ActionTypes;
const Dispatcher = window.Dispatcher;
const Store = require('./es6_store');

let uploading = false;

class ScreenshotStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.SCREENSHOT_UPLOADING:
          uploading = true;
          this.emitChange();
          break;
        case ActionTypes.SCREENSHOT_UPLOADED:
          uploading = false;
          this.emitChange();
          break;
        default:
          break;
      }
    });
  }

  isUploading() {
    return uploading;
  }
};

module.exports = new ScreenshotStore();
