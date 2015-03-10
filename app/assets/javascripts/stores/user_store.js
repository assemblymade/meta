var Store = require('./store')
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');

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

  getUsername: function() {
    if (_currentUser) {
      return _currentUser.username
    }
  },

  isSignedIn: function() {
    return _currentUser !== null
  },

  isStaff: function() {
    return _currentUser && _currentUser.staff;
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
  var user = JSON.parse(dataTag.innerHTML);

  Dispatcher.dispatch({
    type: ActionTypes.USER_RECEIVE,
    user: user
  });

  // FIXME (pletcher) This is a hack for while we're still using a bit of Backbone
  window.app.setCurrentUser(user);
}

module.exports = UserStore
