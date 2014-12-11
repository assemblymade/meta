(function() {
  var ActionTypes = window.CONSTANTS.ActionTypes;
  var Store = require('./store');
  var _store = Object.create(Store);

  var comments = {
    optimistic: [],
    confirmed: []
  };

  var IdeaCommentsStore = _.extend(_store, {
    getComments: function() {
      var optimistic = comments.optimistic || [];
      var confirmed = comments.confirmed || [];

      return {
        optimistic: optimistic,
        confirmed: confirmed
      };
    }
  });

  IdeaCommentsStore.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    switch (action) {
    case ActionTypes.NEWS_FEED_ITEM_CONFIRM_COMMENT:
      confirmComment(data);
      break;
    case ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT:
      optimisticallyAddComment(data);
      break;
    default:
      // fall through
    }
  });

  function confirmComment(data) {
    var optimisticComment = data.comment;

    if (optimisticComment) {
      comments.confirmed.push(optimisticComment);
    }

    IdeaCommentsStore.emitChange();

    comments.confirmed = [];
  }

  function optimisticallyAddComment(comment) {
    comments.optimistic.push(comment);

    IdeaCommentsStore.emitChange();
  }

  if (typeof module !== 'undefined') {
    module.exports = IdeaCommentsStore;
  }
})();


