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

function _showIdea(data) {
  var comments = data.comments;
  var heartables = data.heartables;
  var idea = data.idea;
  var relatedIdeas = data.related_ideas;
  var userHearts = data.user_hearts;

  Dispatcher.dispatch({
    type: ActionTypes.IDEA_RECEIVE,
    idea: idea
  });

  Dispatcher.dispatch({
    type: ActionTypes.RELATED_IDEAS_RECEIVE,
    relatedIdeas: relatedIdeas
  });

  Dispatcher.dispatch({
    type: ActionTypes.DISCUSSION_RECEIVE,
    comments: comments,
    itemId: idea.news_feed_item.id
  });
}
