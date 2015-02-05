'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

let DashboardHandlers = {
  showDashboard(data) {
    let dashboard = data.dashboard
    let newsFeedItems = dashboard.news_feed_items
    let lockedBounties = dashboard.user_locked_bounties
    let reviewingBounties = dashboard.user_reviewing_bounties
    let heartables = dashboard.heartables
    let userHearts = dashboard.user_hearts
    let followedProducts = dashboard.followed_products

    Dispatcher.dispatch({
      type: ActionTypes.DASHBOARD_RECEIVE,
      dashboard: dashboard
    })

    Dispatcher.dispatch({
      type: ActionTypes.NEWS_FEED_ITEMS_RECEIVE,
      news_feed_items: newsFeedItems,
      page: 1,
      pages: 2
    })

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_RECEIVE,
      lockedBounties: lockedBounties,
      reviewingBounties: reviewingBounties
    })

    Dispatcher.dispatch({
      type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
      heartables: (heartables || []).map((heartable) => {
        heartable.heartable_id = heartable.id
        return heartable
      })
    })

    Dispatcher.dispatch({
      type: ActionTypes.LOVE_RECEIVE_USER_HEARTS,
      userHearts: userHearts
    })

    Dispatcher.dispatch({
      type: ActionTypes.PRODUCTS_RECEIVE,
      products: followedProducts
    })
  }
};

module.exports = DashboardHandlers;
