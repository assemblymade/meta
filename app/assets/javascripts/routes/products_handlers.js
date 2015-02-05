'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

let ProductsHandlers = {
  showProduct(data) {
    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: data.product
    });

    Dispatcher.dispatch({
      type: ActionTypes.SCREENSHOTS_RECEIVE,
      screenshots: data.screenshots
    });
  },

  showProductActivity(data) {
    let {
      heartables,
      items,
      page,
      pages,
      product,
      user_hearts: userHearts
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
      news_feed_items: items,
      page: page,
      pages: pages
    });

    Dispatcher.dispatch({
      type: ActionTypes.LOVE_RECEIVE_USER_HEARTS,
      userHearts: userHearts
    });

    Dispatcher.dispatch({
      type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
      heartables: (heartables || []).map((heartable) => {
        heartable.heartable_id = heartable.id;
        return heartable;
      })
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });
  }
};

module.exports = ProductsHandlers;
