//= require underscore
//= require dispatcher
//= require stores/store

var PeopleStore = (function() {
  var _people = [];

  var _store = Object.create(Store);
  var _peopleStore = _.extend(_store, {
    destroy: function() {
      Dispatcher.remove(dispatchIndex);
    },

    setPeople: function(people) {
      _people = people;
    },

    getPeople: function() {
      return _people;
    },

    getPerson: function(username) {
      var index = _searchPeople(username);

      return _people[index];
    },

    addPerson: function(data) {
      _people.push(data.user);

      return this.getPeople();
    },

    removePerson: function(username) {
      var index = _searchPeople(username);

      _people.splice(index, 1);

      return this.getPeople();
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
      if (_people[i].user.username === username) {
        return i;
      }
    }

    return -1;
  }

  return _peopleStore;
})();
