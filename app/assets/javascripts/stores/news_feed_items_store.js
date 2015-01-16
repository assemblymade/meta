var ActionTypes = window.CONSTANTS.ActionTypes;
var Store = require('./es6_store');

var _items = [];
var _loading = false
var _page = 0
var _pages = 0

class NewsFeedItemsStore extends Store {
  constructor() {
    super()

    this.dispatchIndex = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEWS_FEED_ITEMS_RECEIVE:
          _items = action.news_feed_items || []
          _page = action.page
          _pages = action.pages
          _loading = false
          this.emitChange()
          break

        case ActionTypes.NEWS_FEED_ITEMS_REQUEST:
          _loading = true
          this.emitChange()
          break
      }
    });
  }

  getNewsFeedItems() {
    return _items
  }

  getLoading() {
    return _loading
  }

  getPage() {
    return _page
  }

  getPages() {
    return _pages
  }
}

var store = new NewsFeedItemsStore()

var dataTag = document.getElementById('NewsFeedItemsStore')
if (dataTag) {
  data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
    news_feed_items: data.news_feed_items,
    page: data.meta.pagination.page,
    pages: data.meta.pagination.pages
  });
}

module.exports = store
