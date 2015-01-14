var ActionTypes = window.CONSTANTS.ActionTypes;
var Store = require('./es6_store');

var _items = [];

class NewsFeedItemsStore extends Store {
  constructor() {
    super()

    this.dispatchIndex = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEWS_FEED_ITEMS_RECEIVE:
          _items = action.items || []
          this.emitChange()
          break
      }
    });
  }

  getNewsFeedItems() {
    return _items
  }
}

var store = new NewsFeedItemsStore()

var dataTag = document.getElementById('NewsFeedItemsStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
    items: JSON.parse(dataTag.innerHTML)
  });
}

module.exports = store
