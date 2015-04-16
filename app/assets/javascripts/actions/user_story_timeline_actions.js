var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');
var UserStoryTimelineStore = require('../stores/user_story_timeline_store');

var UserStoryTimelineActions = {

  fetchStories: function(user) {
    $.ajax({
      url: "/" + user.id + "/stories",
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.USER_STORIES_RECEIVE,
          stories: data.stories,
          page: data.meta.pagination.page,
          pages: data.meta.pagination.pages
        })
      }
    })
  },

  requestNextPage: function(product) {
    var page = UserStoryTimelineStore.getPage()
    var pages = UserStoryTimelineStore.getPages()
    var loading = UserStoryTimelineStore.getLoading()

    if (loading || page == pages) {
      return
    }

    var stories = UserStoryTimelineStore.getStories()

    $.ajax({
      url: "/" + user.id + "/stories",
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

module.exports = StoryTimelineActions
