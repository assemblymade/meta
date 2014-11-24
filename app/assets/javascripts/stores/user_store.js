var Dispatcher = require('../dispatcher')
var Store = require('../stores/store')
var ActionTypes = require('../constants').ActionTypes

var _currentUser = window.app.currentUser() || null;

var UserStore = _.extend(Object.create(Store), {
  get: function() {
    return _currentUser
  },

  getId: function() {
    if (_currentUser) {
      return _currentUser.id
    }
  },

  isSignedIn: function() {
    return _currentUser !== null
  }
})

module.exports = UserStore
