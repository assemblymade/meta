var ActionTypes = require('../constants').ActionTypes
var routes = require('../routes')
var web = require('../web_util')

module.exports = {
  feedSelected: function(username) {
    web.getAndDispatch(routes.awarded_bounties_user_path({id: username}), ActionTypes.AWARDS_RECEIVE)
  }
}
