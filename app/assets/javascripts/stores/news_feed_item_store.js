const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let item = Immutable.Map();

class NewsFeedItemStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEWS_FEED_ITEM_RECEIVE:
          item = Immutable.Map(action.item);
          this.emitChange();
          break;
      }
    });
  }

  getItem() {
    return item.toJS();
  }
};

module.exports = new NewsFeedItemStore();
