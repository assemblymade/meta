'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

let IdeasHandlers = {
  showCreateIdea(data) {
  },

  showEditIdea(idea) {
    Dispatcher.dispatch({
      type: ActionTypes.IDEA_RECEIVE,
      idea: idea
    });
  },

  showIdeaAdmin(data) {
    Dispatcher.dispatch({
      type: ActionTypes.IDEA_RECEIVE,
      idea: data.idea
    });

    Dispatcher.dispatch({
      type: ActionTypes.IDEA_ADMIN_RECEIVE,
      categories: data.categories,
      topics: data.topics
    });
  },

  showIdeas(data) {
    let {
      categories,
      heartables,
      ideas,
      topics,
      total_pages: totalPages,
      user_hearts: userHearts,
      current_product: currentProduct,
      last_product: lastProduct
    } = data;

    Dispatcher.dispatch({
      type: ActionTypes.IDEAS_RECEIVE,
      ideas: ideas,
      currentProduct: currentProduct,
      lastProduct: lastProduct
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
  },

  showIdea(data) {
    let heartables = data.heartables;
    let idea = data.idea;
    let userHearts = data.user_hearts;

    Dispatcher.dispatch({
      type: ActionTypes.IDEA_RECEIVE,
      idea: idea
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
  },

  showStartConversation(idea) {
    Dispatcher.dispatch({
      type: ActionTypes.IDEA_RECEIVE,
      idea: idea
    });
  }
};

module.exports = IdeasHandlers;
