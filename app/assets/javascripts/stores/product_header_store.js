'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store');

const VALID_ITEMS = ['activity', 'bounties', 'overview', 'partners', 'updates']

let activeTab = 'assets';

class ProductHeaderStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_HEADER_ACTIVE_TAB_CHANGE:
          if (VALID_ITEMS.indexOf(action.activeTab) > -1) {
            activeTab = action.activeTab;
            this.emitChange();
          }
          break;
      }
    });
  }

  getActiveTab() {
    return activeTab;
  }
};

module.exports = new ProductHeaderStore();
