//= require dispatcher
//= require stores/store

var PersonPickerStore = (function() {
  var _people = [];

  var _store = _.extend(Store, {
    addPickedPerson: function(data) {
      var user = data.user;

      if (_searchPeople(user.username) !== -1) {
        return;
      }

      _people.push(user);
    },

    getPickedPerson: function(data) {
      var index = _searchPeople(data.user.username);

      return _people[index];
    },

    getPickedPeople: function() {
      return _people;
    },

    updatePickedPerson: function(data) {
      var user = data.user;
      var index = _searchPeople(user.username);

      _people[index] = user;

      return _people[index];
    },

    removePickedPerson: function(data) {
      var user = data.user;
      var index = _searchPeople(user.username);

      if (index >= 0) {
        _people.splice(index, 1);
      }
    },

    setPickedPeople: function(users) {
      _people = users;
    },

    removeAllPickedPeople: function() {
      _people = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchPeople(username) {
    for (var i = 0, l = _people.length; i < l; i++) {
      var user = _people[i];

      if (user.username === username) {
        return i;
      }
    }

    return -1;
  }

  return _store;
})();
