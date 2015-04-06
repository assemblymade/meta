'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

let ProductsHandlers = {
  showProduct(data) {
    let {
      product,
      screenshots
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_SUBSECTIONS_RECEIVE,
      subsections: product.subsections || {}
    });

    Dispatcher.dispatch({
      type: ActionTypes.SCREENSHOTS_RECEIVE,
      screenshots: screenshots
    });

    _showCreateBounty();
    _setActiveTab('overview');
  },

  showProductActivity(data) {
    let {
      bounty_marks: bountyMarks,
      heartables,
      items,
      page,
      pages,
      post_marks: postMarks,
      product,
      user_hearts: userHearts,
      valuation
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
      type: ActionTypes.POST_MARKS_RECEIVE,
      marks: postMarks
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });

    Dispatcher.dispatch({
      type: ActionTypes.VALUATION_RECEIVE,
      valuation: valuation
    });

    _showCreateBounty();
    _setActiveTab('activity');
  },

  showProductBounties(data) {
    let {
      assets,
      bounties,
      heartables,
      meta: {
        pagination: {
          page,
          pages
        }
      },
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
      type: ActionTypes.BOUNTIES_RECEIVE,
      bounties: bounties,
      page: page,
      pages: pages
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

    _showCreateBounty();
    _setActiveTab('bounties');
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

    _showCreateBounty();
    _setActiveTab('bounties');
  },

  showProductMetrics(product) {
    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });
  },

  showProductTrust(product) {
    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });
  },

  showProductPartners(data) {

    Dispatcher.dispatch({
      type: ActionTypes.PARTNERS_RECEIVE,
      product: data.product,
      partners: data.partners
    });

    _setActiveTab('partners')
  },

  showProductNewPost(data) {
    let {
      product
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });

    _showCreatePost();
    _setActiveTab('activity');
  },

  showProductPost(data) {
    let {
      heartables,
      item,
      post,
      product,
      user_subscriptions: userSubscriptions,
      user_hearts: userHearts
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.NEWS_FEED_ITEM_RECEIVE,
      item: item
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
      type: ActionTypes.POST_RECEIVE,
      post: post
    });

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_RECEIVE,
      product: product
    });

    _showCreatePost();
    _setActiveTab('activity');
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

    _showCreatePost();
    _setActiveTab('activity');
  }
};

module.exports = ProductsHandlers;

function _setActiveTab(tabName) {
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCT_HEADER_ACTIVE_TAB_CHANGE,
    activeTab: tabName
  });
}

function _showCreateBounty() {
  Dispatcher.dispatch({
    type: ActionTypes.CREATE_PRODUCT_ITEM_ACTIVE_ITEM_RECEIVE,
    activeItem: 'bounty'
  });
}

function _showCreatePost() {
  Dispatcher.dispatch({
    type: ActionTypes.CREATE_PRODUCT_ITEM_ACTIVE_ITEM_RECEIVE,
    activeItem: 'post'
  });
}
