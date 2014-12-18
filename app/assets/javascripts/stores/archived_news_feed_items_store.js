var ActionTypes = window.CONSTANTS.ActionTypes;
var Store = require('./es6_store');

var _archivedItems = {};

class ArchivedNewsFeedItemStore extends Store {
  constructor() {
    super()

    this.dispatchIndex = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEWS_FEED_ITEM_ARCHIVED:
          _archivedItems[action.itemId] = 1
          this.emitChange()
          break;
        case ActionTypes.NEWS_FEED_ITEM_UNARCHIVED:
          delete _archivedItems[action.itemId]
          this.emitChange()
          break;
        default:
          // fall through
      }
    });
  }

  isArchived(itemId) {
    return _archivedItems[itemId] === 1
  }
}

module.exports = new ArchivedNewsFeedItemStore()
