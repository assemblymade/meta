'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

let IdeasHandlers = {
  showCreateIdea(data) {
    Dispatcher.dispatch({
      type: ActionTypes.RELATED_IDEAS_RECEIVE,
      relatedIdeas: data.related_ideas
    });
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
    let categories = data.categories;
    let heartables = data.heartables;
    let ideas = data.ideas;
    let topics = data.topics;
    let totalPages = data.total_pages;
    let userHearts = data.user_hearts;

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
  },

  showIdea(data) {
    let comments = data.comments;
    let heartables = data.heartables;
    let idea = data.idea;
    let relatedIdeas = data.related_ideas;
    let userHearts = data.user_hearts;

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
  },

  showStartConversation(idea) {
    Dispatcher.dispatch({
      type: ActionTypes.IDEA_RECEIVE,
      idea: idea
    });
  }
};

module.exports = IdeasHandlers;
