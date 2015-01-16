var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes

var routes = [
  ['/ideas', require('../components/ideas/ideas_index.js.jsx'), _showIdeas],
  ['/ideas/new', require('../components/ideas/ideas_new.js.jsx'), _showCreateIdea],
  ['/ideas/:id', require('../components/ideas/idea_show.js.jsx'), _showIdea]
];

module.exports = routes;

function _showCreateIdea(data) {
  Dispatcher.dispatch({
    type: ActionTypes.RELATED_IDEAS_RECEIVE,
    relatedIdeas: data.related_ideas
  });
}

function _showIdeas(data) {
  var heartables = data.heartables;
  var ideas = data.ideas;
  var totalPages = data.total_pages;
  var userHearts = data.user_hearts;

  Dispatcher.dispatch({
    type: ActionTypes.IDEAS_RECEIVE,
    ideas: ideas
  });

  Dispatcher.dispatch({
    type: ActionTypes.PAGINATION_TOTAL_PAGES_RECEIVE,
    totalPages: totalPages
  });

  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
    heartables: (heartables || []).map((heartable) => {
      heartable.heartable_id = heartable.id;
      return heartable;
    })
  });

  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_USER_HEARTS,
    userHearts: userHearts
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

  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_HEARTABLES,
    heartables: (heartables || []).map((heartable) => {
      heartable.heartable_id = heartable.id;
      return heartable;
    })
  });

  Dispatcher.dispatch({
    type: ActionTypes.LOVE_RECEIVE_USER_HEARTS,
    userHearts: userHearts
  });
}
