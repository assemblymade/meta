'use strict';

const ActionTypes = window.CONSTANTS.ActionTypes;
const Dispatcher = window.Dispatcher;
const Store = require('./es6_store');

let uploading = false;

class ProductScreenshotStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action) {
        case ActionTypes.PRODUCT_SCREENSHOT_UPLOADING:
          uploading = true;
          this.emitChange();
          break;
        case ActionTypes.PRODUCT_SCREENSHOT_UPLOADED:
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

module.exports = new ProductScreenshotStore();
