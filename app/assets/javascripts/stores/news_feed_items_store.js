'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const { List } = require('immutable');
const Store = require('./es6_store');

let _items = List();
let _loading = false
let _page = 1
let _pages = 1

class NewsFeedItemsStore extends Store {
  constructor() {
    super()

    this.dispatchIndex = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.NEWS_FEED_ITEMS_RECEIVE:
          _items = List(action.news_feed_items)
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

let store = new NewsFeedItemsStore()

let dataTag = document.getElementById('NewsFeedItemsStore')
if (dataTag) {
  let data = JSON.parse(dataTag.innerHTML)
  let action = {
    type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
    news_feed_items: data.news_feed_items
  }

  if (data.meta && data.meta.pagination) {
    action.page = data.meta.pagination.page
    action.pages = data.meta.pagination.pages
  }

  Dispatcher.dispatch(action)
}

module.exports = store
