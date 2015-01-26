var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes

var routes = [
  ['/dashboard',         require('../components/dashboard/dashboard_index.js.jsx'), _showDashboard],
  ['/dashboard/:filter', require('../components/dashboard/dashboard_index.js.jsx'), _showDashboard]
];

module.exports = routes;

function _showDashboard(data) {
  Dispatcher.dispatch({
    type: ActionTypes.DASHBOARD_RECEIVE,
    dashboard: data.dashboard
  })
}
