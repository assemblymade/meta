var Dispatcher = window.Dispatcher
var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes

var routes = [
  ['/ideas', require('../components/ideas/ideas_index.js.jsx'), _showIdeas],
  ['/ideas/new', require('../components/ideas/ideas_new.js.jsx'), _showCreateIdea],
  ['/ideas/:id', require('../components/ideas/idea_show.js.jsx'), _showIdea],
  ['/ideas/:id/admin', require('../components/ideas/idea_admin.js.jsx'), _showIdeaAdmin],
  ['/ideas/:id/edit', require('../components/ideas/idea_edit.js.jsx'), _showEditIdea],
  ['/ideas/:id/start-conversation', require('../components/ideas/idea_start_conversation.js.jsx'), _showStartConversation],
  ['/:id', require('../components/products/product_show.js.jsx'), _showProduct]
];

module.exports = routes;

// TODO: (pletcher) Figure out how to declare routes so that we
// respect routing priority while maintaining route separation

function _showProduct(data) {
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCT_RECEIVE,
    product: data.product
  });

  Dispatcher.dispatch({
    type: ActionTypes.SCREENSHOTS_RECEIVE,
    screenshots: data.screenshots
  });
}

function _showCreateIdea(data) {
  Dispatcher.dispatch({
    type: ActionTypes.RELATED_IDEAS_RECEIVE,
    relatedIdeas: data.related_ideas
  });
}

function _showEditIdea(idea) {
  Dispatcher.dispatch({
    type: ActionTypes.IDEA_RECEIVE,
    idea: idea
  });
}

function _showIdeaAdmin(data) {
  Dispatcher.dispatch({
    type: ActionTypes.IDEA_RECEIVE,
    idea: data.idea
  });

  Dispatcher.dispatch({
    type: ActionTypes.IDEA_ADMIN_RECEIVE,
    categories: data.categories,
    topics: data.topics
  });
}

function _showIdeas(data) {
  var categories = data.categories;
  var heartables = data.heartables;
  var ideas = data.ideas;
  var topics = data.topics;
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

  Dispatcher.dispatch({
    type: ActionTypes.IDEA_ADMIN_RECEIVE,
    categories: categories,
    topics: topics
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

function _showStartConversation(idea) {
  Dispatcher.dispatch({
    type: ActionTypes.IDEA_RECEIVE,
    idea: idea
  });
}
