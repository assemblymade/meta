var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store');

var _archivedItems = {};

class ArchivedNewsFeedItemsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.ARCHIVED_NEWS_FEED_ITEMS_RECEIVE:
          _archivedItems = action.items
          this.emitChange()
          break
        case ActionTypes.NEWS_FEED_ITEM_ARCHIVED:
          _archivedItems[action.itemId] = 1
          this.emitChange()
          break
        case ActionTypes.NEWS_FEED_ITEM_UNARCHIVED:
          delete _archivedItems[action.itemId]
          this.emitChange()
          break
        default:
          // fall through
      }
    });
  }

  isArchived(itemId) {
    return _archivedItems[itemId] === 1
  }
}

var store = new ArchivedNewsFeedItemsStore()

var dataTag = document.getElementById('ArchivedNewsFeedItemsStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.ARCHIVED_NEWS_FEED_ITEMS_RECEIVE,
    items: JSON.parse(dataTag.innerHTML)
  });
}

module.exports = store
