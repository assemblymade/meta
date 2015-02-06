'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let assets = Immutable.List();

class AssetsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.ASSETS_RECEIVE:
          assets = Immutable.List(action.assets);
          this.emitChange();
          break;
      }
    });
  }

  getAssets() {
    return assets.toJS();
  }
};

module.exports = new AssetsStore();
