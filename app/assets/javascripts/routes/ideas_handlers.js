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
    window.location.href = 'http://changelog.assembly.com/rfs'
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
