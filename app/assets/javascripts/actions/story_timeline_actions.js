var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

var StoryTimelineActions = {

  fetchStories: function(product) {
    $.ajax({
      url: "/" + product.slug + "/stories",
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_STORIES_RECEIVE,
          stories: data
        })
      }
    })
  }
}

module.exports = StoryTimelineActions
