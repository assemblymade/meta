(function() {
  var CONSTANTS = require('../constants').NEWS_FEED_ITEM;
  var Dispatcher = require('../dispatcher');
  var Store = require('../stores/store');
  var _store = Object.create(Store);

  var comments = {
    optimistic: {},
    confirmed: {}
  };

  var NewsFeedItemStore = _.extend(_store, {

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

  function confirmComment(comment) {
    console.log(comment);
  }

  function optimisticallyAddComment(comment) {
    console.log(comment);
  }

  if (typeof module !== 'undefined') {
    module.exports = NewsFeedItemStore;
  }
})();
