//= require dispatcher
//= require stores/store

var CoinOwnershipStore = (function() {
  // { user: User, ownership: Number }
  var _usersAndOwnerships = [];

  var _store = _.extend(Store, {
    addUser: function(data) {
      var userAndOwnership = data.userAndOwnership;

      if (_searchUsers(userAndOwnership.user.username) !== -1) {
        return;
      }

      _usersAndOwnerships.push(userAndOwnership);
    },

    getUser: function(data) {
      var index = _searchUsers(data.username);

      return _usersAndOwnerships[index];
    },

    getUsers: function() {
      return _usersAndOwnerships;
    },

    updateUser: function(data) {
      var userAndOwnership = data.userAndOwnership;
      var index = _searchUsers(userAndOwnership.user.username);

      if (index === -1) {
        return;
      }

      _usersAndOwnerships[index] = userAndOwnership;

      return _usersAndOwnerships[index];
    },

    removeUser: function(data) {
      var userAndOwnership = data.userAndOwnership;
      var index = _searchUsers(userAndOwnership.user.username);

      if (index >= 0) {
        _usersAndOwnerships.splice(index, 1);
      }
    },

    setUsers: function(users) {
      _usersAndOwnerships = users;
    },

    removeAllUsers: function() {
      _usersAndOwnerships = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchUsers(username) {
    for (var i = 0, l = _usersAndOwnerships.length; i < l; i++) {
      var userAndOwnership = _usersAndOwnerships[i];

      if (userAndOwnership.user.username === username) {
        return i;
      }
    }

    return -1;
  }

  return _store;
})();
