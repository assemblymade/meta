var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

var rrUrl = ''
if ($('meta[name=read-raptor-url]')) {
  rrUrl = $('meta[name=read-raptor-url]').attr('content')
}

var StoryActions = {
  acknowledge: function() {
    Dispatcher.dispatch({
      type: ActionTypes.STORY_ACKNOWLEDGE_STORIES,
      timestamp: moment().unix()
    })
  },

  fetchStories: function(topId) {
    var options = {}
    if (topId) {
      options.data = {top_id: topId}
    }
    $.ajax({
      url: routes.notifications_path(options),
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
    var currentUser = app.currentUser()
    if (!currentUser) {
      return
    }
    var url = rrUrl +
      '/readers/' +
      currentUser.get('id') +
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
        stories: [story]
      })
    })
  },

  markAllAsRead: function(stories) {
    // this could be more efficient
    _(stories).each(this.markAsRead)
  }

}

module.exports = StoryActions
