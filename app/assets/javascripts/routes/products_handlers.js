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
      bounty_marks: bountyMarks,
      heartables,
      items,
      page,
      pages,
      product,
      product_marks: productMarks,
      user_hearts: userHearts
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTY_MARKS_RECEIVE,
      marks: bountyMarks
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
      type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
      news_feed_items: items,
      page: page,
      pages: pages
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_MARKS_RECEIVE,
      marks: productMarks
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });
  },

  showProductBounties(data) {
    let {
      assets,
      heartables,
      product,
      tags: bountyMarks,
      user_hearts: userHearts,
      valuation
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.ASSETS_RECEIVE,
      assets: assets
    });

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTY_MARKS_RECEIVE,
      marks: bountyMarks
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

    Dispatcher.dispatch({
      type: ActionTypes.VALUATION_RECEIVE,
      valuation: valuation
    });
  },

  showProductBounty(data) {
    let {
      assets,
      bounty,
      heartables,
      item,
      product,
      tags: bountyMarks,
      user_hearts: userHearts,
      valuation
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.ASSETS_RECEIVE,
      assets: assets
    });

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTY_RECEIVE,
      bounty: bounty
    });

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTY_MARKS_RECEIVE,
      marks: bountyMarks
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
      type: ActionTypes.NEWS_FEED_ITEM_RECEIVE,
      item: item
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });

    Dispatcher.dispatch({
      type: ActionTypes.VALUATION_RECEIVE,
      valuation: valuation
    });
  },

  showProductPosts(data) {
    let {
      heartables,
      posts,
      product
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
      heartables: (heartables || []).map((heartable) => {
        heartable.heartable_id = heartable.id;
        return heartable;
      })
    });

    Dispatcher.dispatch({
      type: ActionTypes.POSTS_RECEIVE,
      posts: posts
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });
  }
};

module.exports = ProductsHandlers;
