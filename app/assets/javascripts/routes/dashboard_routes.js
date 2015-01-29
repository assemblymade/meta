var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes

var routes = [
  ['/dashboard',         require('../components/dashboard/dashboard_index.js.jsx'), _showDashboard],
  ['/dashboard/:filter', require('../components/dashboard/dashboard_index.js.jsx'), _showDashboard]
]

exports.routes = routes;
exports.action = ActionTypes.DASHBOARD_ROUTE_CHANGED;

function _showDashboard(data) {
  var dashboard = data.dashboard
  var newsFeedItems = dashboard.news_feed_items
  var lockedBounties = dashboard.user_locked_bounties
  var reviewingBounties = dashboard.user_reviewing_bounties
  var heartables = dashboard.heartables
  var userHearts = dashboard.user_hearts
  var followedProducts = dashboard.followed_products

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
