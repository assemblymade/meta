var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('./store');

var _usersAndCoins = [];

var _store = Object.create(Store);
var _coinOwnershipStore = _.extend(_store, {
  addUser: function(data) {
    var userAndCoins = data.userAndCoins;

    if (_searchUsers(userAndCoins.username) !== -1) {
      return;
    }

    _usersAndCoins.push(userAndCoins);
  },

  getUser: function(data) {
    var index = _searchUsers(data.username);

    return _usersAndCoins[index];
  },

  getUsers: function() {
    return _usersAndCoins;
  },

  updateUser: function(data) {
    var userAndCoins = data.userAndCoins;
    var index = _searchUsers(userAndCoins.username);

    if (index === -1) {
      return;
    }

    _usersAndCoins[index] = userAndCoins;

    return _usersAndCoins[index];
  },

  removeUser: function(data) {
    var userAndCoins = data.userAndCoins;
    var index = _searchUsers(userAndCoins.username);

    if (index >= 0) {
      _usersAndCoins.splice(index, 1);
    }
  },

  setUsers: function(users) {
    _usersAndCoins = users;
  },

  removeAllUsers: function() {
    _usersAndCoins = [];
  }
});

_store.dispatchToken = Dispatcher.register(function(payload) {
  var action = payload.action;
  var data = payload.data;

  _store[action] && _store[action](data);
  _store.emitChange();
});

function _searchUsers(username) {
  for (var i = 0, l = _usersAndCoins.length; i < l; i++) {
    var userAndCoins = _usersAndCoins[i];

    if (userAndCoins.username === username) {
      return i;
    }
  }

  return -1;
}

module.exports = window.CoinOwnershipStore = _coinOwnershipStore;
