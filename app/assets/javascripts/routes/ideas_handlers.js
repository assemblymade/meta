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
    let idea = data.idea;
    window.location.href = `http://changelog.assembly.com/rfs/${idea.slug}`
  },

  showStartConversation(idea) {
    Dispatcher.dispatch({
      type: ActionTypes.IDEA_RECEIVE,
      idea: idea
    });
  }
};

module.exports = IdeasHandlers;
