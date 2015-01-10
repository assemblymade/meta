var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes

var routes = [
  ['/ideas', require('./ideas_index.js.jsx'), _showIdeas],
  ['/ideas/:id', require('./idea_show.js.jsx'), _showIdea]
];

module.exports = routes;

function _showIdeas(ideas) {
  Dispatcher.dispatch({
    type: ActionTypes.IDEAS_RECEIVE,
    ideas: ideas
  });
}

function _showIdea(idea) {
  Dispatcher.dispatch({
    type: ActionTypes.IDEA_RECEIVE,
    idea: idea
  });
}
