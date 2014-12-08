// var Dispatcher = require('../dispatcher')
var Store = require('./store')
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken;
var _currentUser = null;

var UserStore = _.extend(Object.create(Store), {
  init: function() {
    _dispatchToken = Dispatcher.register(function(action) {
      switch(action.type) {
        case ActionTypes.USER_SIGNED_IN:
          _currentUser = action.user
          this.emitChange()
      }
    }.bind(this))
  },

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

UserStore.init()

module.exports = UserStore
