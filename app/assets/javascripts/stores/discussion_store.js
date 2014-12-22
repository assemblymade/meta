var ActionTypes = window.CONSTANTS.ActionTypes;
// var Dispatcher = require('../dispatcher');
var Store = require('./es6_store');

var _comments = {
  optimistic: {},
  confirmed: {}
};

var _events = {};

class DiscussionStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
      case ActionTypes.NEWS_FEED_ITEM_CONFIRM_COMMENT:
        confirmComment(action.data)

        this.emitChange()
        break
      case ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT:
        optimisticallyAddComment(action.data)

        this.emitChange()
        break
      case ActionTypes.DISCUSSION_RECEIVE:
        setComments(action)
        setEvents(action)

        this.emitChange()
        break
      default:
        // fall through
      }
    });
  }

  getComments(itemId) {
    var confirmed = _comments.confirmed[itemId] || []
    var optimistic = _comments.optimistic[itemId] || []

    return {
      confirmed: confirmed,
      optimistic: optimistic
    }
  }

  getEvents(itemId) {
    return _events[itemId] || []
  }
}

module.exports = new DiscussionStore();

function confirmComment(data) {
  var thread = data.thread;
  var timestamp = data.timestamp;
  var optimisticThread = _comments.optimistic[thread] || [];

  for (var i = 0, l = optimisticThread.length; i < l; i++) {
    if (optimisticThread[i].created_at === timestamp) {
      optimisticThread = optimisticThread.splice(i, 1);
    }
  }

  var optimisticComment = data.comment;

  if (optimisticComment) {
    if (_comments.confirmed[thread]) {
      _comments.confirmed[thread].push(optimisticComment);
    } else {
      _comments.confirmed[thread] = [optimisticComment];
    }
  }

  // NewsFeedItemStore.emitChange();

  // // FIXME: (pletcher) There shouldn't be side effects like this in the store.
  // //        Instead, initialize the store with the comments from the server
  // //        and keep all of them here
  // _comments.confirmed[thread] = [];
}

function optimisticallyAddComment(comment) {
  if (_comments.optimistic[comment.news_feed_item_id]) {
    _comments.optimistic[comment.news_feed_item_id].push(comment);
  } else {
    _comments.optimistic[comment.news_feed_item_id] = [comment];
  }
}

function setComments(action) {
  var comments = action.comments;
  var itemId = action.itemId;

  _comments.confirmed[itemId] = comments;
}

function setEvents(action) {
  var events = action.events;
  var itemId = action.itemId;

  _events[itemId] = events;
}
