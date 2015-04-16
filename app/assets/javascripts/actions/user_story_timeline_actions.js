var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');
var UserStoryTimelineStore = require('../stores/user_story_timeline_store');

var UserStoryTimelineActions = {

  fetchStories: function(user) {
    $.ajax({
      url: "/users/" + user.username + "/stories",
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.USER_STORIES_RECEIVE,
          stories: data.stories,
          products: data.products
        })
      }
    })
  }
}

module.exports = UserStoryTimelineActions
