// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;
var DiscussionStore = require('../stores/discussion_store');

var DiscussionActionCreators = {
  fetchCommentsFromServer: function(url, itemId) {
    $.ajax({
      method: 'GET',
      headers: {
        accept: 'application/json'
      },
      url: url,
      success: function(data) {
        TrackEngagement.track(data.analytics.discussion_type, data.analytics)
        Dispatcher.dispatch({
          type: ActionTypes.DISCUSSION_RECEIVE,
          comments: data.comments,
          events: data.events,
          itemId: itemId,
          userHearts: data.user_hearts,
          userTips: data.user_tips,
        });
      },

      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  }
};

module.exports = DiscussionActionCreators;
