var routes = require('../routes')
var ActionTypes = window.CONSTANTS.ActionTypes
var rrUrl = $('meta[name=read-raptor-url]').attr('content')

var StoryActionCreators = {
  fetchStories: function() {
    $.ajax({
      url: routes.notifications_path(),
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.STORY_RECEIVE_STORIES,
          stories: data
        })
      }
    })
  },

  fetchReadState: function(storyKeys) {
    var url = rrUrl +
      '/readers/' +
      app.currentUser().get('id') +
      '/articles?' +
      _.map(storyKeys, function(k) {
        return 'key=' + k
      }
    ).join('&')

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.RR_RECEIVE_READ_RECEIPTS,
          articles: data
        })
      }
    })
  },

  markAsRead: function(story) {
    Dispatcher.dispatch({
      type: ActionTypes.STORY_MARKING_AS_READ,
      stories: [story]
    })

    $.get(routes.readraptor_path({article_id: story.key}), ()=>{
      Dispatcher.dispatch({
        type: ActionTypes.STORY_MARKED_AS_READ,
        stories: [story]
      })
    })
  }

}

module.exports = StoryActionCreators
