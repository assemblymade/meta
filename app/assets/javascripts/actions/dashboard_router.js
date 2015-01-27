var ActionTypes = window.CONSTANTS.ActionTypes;
var dashboardRoutes = require('../routes/dashboard_routes.js');
var Router = require('./router.js');

module.exports = new Router(
  ActionTypes.DASHBOARD_ROUTE_CHANGED,
  dashboardRoutes
);
