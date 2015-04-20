var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');
var UserStoryTimelineStore = require('../stores/user_story_timeline_store');

var UserStoryTimelineActions = {

  fetchNewStories: function(user, filter) {
    $.ajax({
      url: "/users/" + user.username + "/stories/" + filter,
      type: 'GET',
      dataType: 'json',
      data: {page: 1},
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.USER_STORIES_RECEIVE,
          stories: data.stories,
          products: data.products
        })
      }
    })
  },

  fetchStories: function(user, filter) {
    var page = UserStoryTimelineStore.getPage()
    var pages = UserStoryTimelineStore.getPages()
    var loading = UserStoryTimelineStore.getLoading()
    var stories = UserStoryTimelineStore.getStories()
    var products = UserStoryTimelineStore.getProducts()

    var stories = UserStoryTimelineStore.getStories()
    var products = UserStoryTimelineStore.getProducts()

    if (filter == null || filter == "interests" || filter == "all") {
      $.ajax({
        url: "/users/"+user.username + "/stories",
        type: 'GET',
        dataType: 'json',
        data: {page: page + 1},
        success: function(data) {
          Dispatcher.dispatch({
            type: ActionTypes.USER_STORIES_RECEIVE,
            stories: stories.concat(data.stories),
            products: products.concat(data.products)
          })
        }
      })
    }
    else {
      $.ajax({
        url: "/users/" + user.username + "/stories/" + filter,
        type: 'GET',
        dataType: 'json',
        data: {page: page + 1},
        success: function(data) {
          Dispatcher.dispatch({
            type: ActionTypes.USER_STORIES_RECEIVE,
            stories: stories.concat(data.stories),
            products: products.concat(data.products)
          })
        }
      })
    }
  }
}

module.exports = UserStoryTimelineActions
