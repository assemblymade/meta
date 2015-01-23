var ActionTypes = window.CONSTANTS.ActionTypes;
var ideasRoutes = require('../routes/ideas_routes');
var Router = require('./router');

module.exports = new Router(
  ActionTypes.IDEAS_ROUTE_CHANGED,
  ideasRoutes
);
