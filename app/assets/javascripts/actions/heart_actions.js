var ActionTypes = require('../constants').ActionTypes
var routes = require('../routes')
var web = require('../web_util')

module.exports = {
  feedSelected: function(username) {
    web.getAndDispatch(routes.heart_stories_user_path({id: username}), ActionTypes.HEARTS_STORIES_RECEIVE)
  },

  acknowledge: function() {
    Dispatcher.dispatch({
      type: ActionTypes.HEARTS_ACKNOWLEDGED
    })
  }
}
