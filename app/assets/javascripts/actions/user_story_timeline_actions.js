var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');
var UserStoryTimelineStore = require('../stores/user_story_timeline_store');

var UserStoryTimelineActions = {

  fetchStories: function(user, filter) {
    var page = UserStoryTimelineStore.getPage()
    var pages = UserStoryTimelineStore.getPages()
    var loading = UserStoryTimelineStore.getLoading()

    if (filter == null || filter == "interests") {
      $.ajax({
        url: "/users/"+user.username + "/stories",
        type: 'GET',
        dataType: 'json',
        data: {page: page + 1},
        success: function(data) {
          Dispatcher.dispatch({
            type: ActionTypes.USER_STORIES_RECEIVE,
            stories: data.stories,
            products: data.products
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
            stories: data.stories,
            products: data.products
          })
        }
      })
    }
  },

  requestNextPage: function(user, filter) {
    var page = UserStoryTimelineStore.getPage()
    var pages = UserStoryTimelineStore.getPages()
    var loading = UserStoryTimelineStore.getLoading()

    if (loading || page == pages) {
      return
    }

    var stories = UserStoryTimelineStore.getStories()

    $.ajax({
      url: "/" + product.slug + "/stories",
      type: 'GET',
      dataType: 'json',
      data: {page: page + 1},
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_STORIES_RECEIVE,
          stories: stories.concat(data.stories),
          page: data.meta.pagination.page,
          pages: data.meta.pagination.pages
        })
      }
    })
  }

}

module.exports = UserStoryTimelineActions
