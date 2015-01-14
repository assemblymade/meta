var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes

var routes = [
  ['/ideas', require('./ideas_index.js.jsx'), _showIdeas],
  ['/ideas/new', require('./ideas_new.js.jsx'), _showCreateIdea],
  ['/ideas/:id', require('./idea_show.js.jsx'), _showIdea]
];

module.exports = routes;

function _showCreateIdea(data) {
  Dispatcher.dispatch({
    type: ActionTypes.RELATED_IDEAS_RECEIVE,
    relatedIdeas: data.related_ideas
  });
}

function _showIdeas(data) {
  var ideas = data.ideas;
  var totalPages = data.total_pages;

  Dispatcher.dispatch({
    type: ActionTypes.IDEAS_RECEIVE,
    ideas: ideas
  });

  Dispatcher.dispatch({
    type: ActionTypes.PAGINATION_TOTAL_PAGES_RECEIVE,
    totalPages: totalPages
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
