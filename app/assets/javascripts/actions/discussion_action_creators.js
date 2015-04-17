var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher')
var DiscussionStore = require('../stores/discussion_store');
var LoveActions = require('../actions/love_action_creators');
var LoveStore = require('../stores/love_store');
var Routes = require('../routes');

module.exports = {
  fetchCommentsFromServer(itemId) {
    var url = Routes.discussion_comments_path({
      discussion_id: itemId
    });

    $.ajax({
      method: 'GET',
      headers: {
        accept: 'application/json'
      },
      url: url,
      success: function(data) {
        TrackEngagement.track(data.analytics.discussion_type, data.analytics)
        LoveActions.retrieveRecentHearts(LoveStore.getAllHeartableIds())
        Dispatcher.dispatch({
          type: ActionTypes.DISCUSSION_RECEIVE,
          comments: data.comments,
          events: data.events,
          itemId: itemId,
          userHearts: data.user_hearts,
          userTips: data.user_tips
        });
      },

      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  },

  discussionSelected(id) {
    window.pusher.subscribe(id).bind_all((message, data) => {
      Dispatcher.dispatch({
        type: message,
        data: data
      })
    });
  },

  discussionClosed(id) {
    window.pusher.unsubscribe(id)
  }
};
