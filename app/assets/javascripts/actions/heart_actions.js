var ActionTypes = require('../constants').ActionTypes
var routes = require('../routes')
var web = require('../web_util')

module.exports = {
  fetchFeedPage: function(username, page) {
    web.getAndDispatch(
      routes.heart_stories_user_path({params: {id: username}, data: {page: page}}),
      ActionTypes.HEARTS_STORIES_RECEIVE
    )
  },

  acknowledge: function() {
    Dispatcher.dispatch({
      type: ActionTypes.HEARTS_ACKNOWLEDGED
    })
  }
}
