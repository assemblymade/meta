var routes = require('../routes');

module.exports = {
  newSession: function() {
    window.location = routes.new_user_session_path()
  }
}
