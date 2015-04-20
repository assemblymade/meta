'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let item = null

class NewsFeedItemStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEWS_FEED_ITEM_RECEIVE:
          item = action.item
          this.emitChange();
          break;
        case ActionTypes.NEWS_FEED_ITEM_CLOSE:
          item = null
          this.emitChange();
          break;
      }
    });
  }

  getItem() {
    return item
  }
};

module.exports = new NewsFeedItemStore();
