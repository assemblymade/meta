'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store');

const VALID_ITEMS = ['asset', 'bounty', 'post']

let activeItem = 'bounty';

class CreateProductItemStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.CREATE_PRODUCT_ITEM_ACTIVE_ITEM_RECEIVE:
          if (VALID_ITEMS.indexOf(action.activeItem) > -1) {
            activeItem = action.activeItem;
            this.emitChange();
          }
          break;
      }
    });
  }

  getActiveMenuItem() {
    return activeItem;
  }
};

module.exports = new CreateProductItemStore();
