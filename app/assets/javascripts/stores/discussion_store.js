var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store');

var _comments = {
  optimistic: {},
  confirmed: {}
};

var _events = {};
var _canUpdate = false

class DiscussionStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.BOUNTY_RECEIVE:
          _canUpdate = action.bounty.can_update
          break

        case ActionTypes.COMMENT_UPDATED:
          updateComment(action)
          break

        case ActionTypes.DISCUSSION_RECEIVE:
          setComments(action)
          setEvents(action)
          break

        case ActionTypes.NEWS_FEED_ITEM_CONFIRM_COMMENT:
          confirmComment(action.data)
          break

        case ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT:
          optimisticallyAddComment(action.data)
          break

        default:
          return
      }
      this.emitChange()
    });
  }

  canUpdate() {
    return _canUpdate
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

  var confirmedComment = data.comment;

  if (confirmedComment) {
    if (_comments.confirmed[thread]) {
      _comments.confirmed[thread].push(confirmedComment);
    } else {
      _comments.confirmed[thread] = [confirmedComment];
    }
  }
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

function updateComment(action) {
  var comment = action.comment;
  var itemId = comment.news_feed_item_id;
  var comments = _comments.confirmed[itemId];

  if (comments && comments.length) {
    for (var i = 0, l = comments.length; i < l; i++) {
      var c = comments[i];

      if (c.id === comment.id) {
        // `c` holds the value of comments[i], not a reference to it;
        // we need to update comments[i] directly
        comments[i] = comment;
        break;
      }
    }
  }
}
