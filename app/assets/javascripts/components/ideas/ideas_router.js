// var Dispatcher = require('../../dispatcher');
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes
var ideasRoutes = require('./ideas_routes')
var page = require('page')
var qs = require('qs')

class IdeasRouter {
}

module.exports = new IdeasRouter(ideasRoutes);
