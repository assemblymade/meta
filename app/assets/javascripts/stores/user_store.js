// var Dispatcher = require('../dispatcher')
var Store = require('./store')
var ActionTypes = window.CONSTANTS.ActionTypes
var Dispatcher = window.Dispatcher;

var _dispatchToken;
var _currentUser = null;

var UserStore = _.extend(Object.create(Store), {
  init: function() {
    _dispatchToken = Dispatcher.register(function(action) {
      switch(action.type) {
        case ActionTypes.USER_RECEIVE:
          _setUser(action.user)
          this.emitChange();

          break;
        case ActionTypes.USER_SIGNED_IN:
          _setUser(action.user)
          this.emitChange()
          break;
      }
    }.bind(this))
  },

  getUser: function() {
    return _currentUser
  },

  getId: function() {
    if (_currentUser) {
      return _currentUser.id
    }
  },

  isSignedIn: function() {
    return _currentUser !== null
  },

  isStaff: function() {
    return _currentUser && _currentUser.is_staff;
  }
});

UserStore.init()

function _setUser(user) {
  if (_currentUser) {
    _currentUser = _.extend(_currentUser, user)
  } else {
    _currentUser = user;
  }
}

var dataTag = document.getElementById('UserStore');
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.USER_RECEIVE,
    user: JSON.parse(dataTag.innerHTML)
  });
}

module.exports = UserStore
