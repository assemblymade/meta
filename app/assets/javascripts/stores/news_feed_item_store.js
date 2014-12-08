(function() {
  var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
  // var Dispatcher = require('../dispatcher');
  var Store = require('./store');
  var _store = Object.create(Store);

  var comments = {
    optimistic: {},
    confirmed: {}
  };

  var NewsFeedItemStore = _.extend(_store, {
    getComments: function(thread) {
      var optimistic = comments.optimistic[thread] || [];
      var confirmed = comments.confirmed[thread] || [];

      return {
        optimistic: optimistic,
        confirmed: confirmed
      };
    }
  });

  NewsFeedItemStore.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    switch (action) {
    case CONSTANTS.ACTIONS.CONFIRM_COMMENT:
      confirmComment(data);
      break;
    case CONSTANTS.ACTIONS.OPTIMISTICALLY_ADD_COMMENT:
      optimisticallyAddComment(data);
      break;
    default:
      // fall through
    }
  });

  function confirmComment(data) {
    var thread = data.thread;
    var timestamp = data.timestamp;
    var optimisticThread = comments.optimistic[thread] || [];

    for (var i = 0, l = optimisticThread.length; i < l; i++) {
      if (optimisticThread[i].created_at === timestamp) {
        optimisticThread = optimisticThread.splice(i, 1);
      }
    }

    var optimisticComment = data.comment;

    if (optimisticComment) {
      if (comments.confirmed[thread]) {
        comments.confirmed[thread].push(optimisticComment);
      } else {
        comments.confirmed[thread] = [optimisticComment];
      }
    }

    NewsFeedItemStore.emitChange();

    comments.confirmed[thread] = [];
  }

  function optimisticallyAddComment(comment) {
    if (comments.optimistic[comment.news_feed_item_id]) {
      comments.optimistic[comment.news_feed_item_id].push(comment);
    } else {
      comments.optimistic[comment.news_feed_item_id] = [comment]
    }

    NewsFeedItemStore.emitChange();
  }

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItemStore;
  }
})();
