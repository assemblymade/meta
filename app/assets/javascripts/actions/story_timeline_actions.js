var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');
var StoryTimelineStore = require('../stores/story_timeline_store');

var StoryTimelineActions = {

  fetchStories: function(product) {
    $.ajax({
      url: "/" + product.slug + "/stories",
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_STORIES_RECEIVE,
          stories: data.stories,
          page: data.meta.pagination.page,
          pages: data.meta.pagination.pages
        })
      }
    })
  },

  requestNextPage: function(product) {
    var page = StoryTimelineStore.getPage()
    var pages = StoryTimelineStore.getPages()
    var loading = StoryTimelineStore.getLoading()

    if (loading || page == pages) {
      return
    }

    var stories = StoryTimelineStore.getStories()

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

module.exports = StoryTimelineActions
