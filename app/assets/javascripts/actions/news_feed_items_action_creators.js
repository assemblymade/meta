var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var NewsFeedItemsStore = require ('../stores/news_feed_items_store.js');

module.exports = {
  retrieveNewsFeedItems: function(params) {
    $.ajax({
      url: '/news_feed_items',
      type: 'GET',
      dataType: 'json',
      data: params,
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
          news_feed_items: data.news_feed_items,
          page: data.meta.pagination.page,
          pages: data.meta.pagination.pages
        })
      }
    })
  },

  requestNextPage: function(params) {
    var page = NewsFeedItemsStore.getPage()
    var pages = NewsFeedItemsStore.getPages()
    var loading = NewsFeedItemsStore.getLoading()

    if (loading || page == pages) {
      return
    }

    var items = NewsFeedItemsStore.getNewsFeedItems()

    Dispatcher.dispatch({ type: ActionTypes.NEWS_FEED_ITEMS_REQUEST });

    params.page = page + 1

    $.ajax({
      url: params.url || '/news_feed_items',
      type: 'GET',
      dataType: 'json',
      data: params,
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
          news_feed_items: items.toJS().concat(data.news_feed_items),
          page: data.meta.pagination.page,
          pages: data.meta.pagination.pages
        })
      }
    })
  }
}
