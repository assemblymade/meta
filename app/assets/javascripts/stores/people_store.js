//= require underscore
//= require dispatcher
//= require stores/store

var PeopleStore = (function() {
  var _people = [];

  var _store = _.extend(Store, {
    destroy: function() {
      Dispatcher.remove(dispatchIndex);
    },

    setPeople: function(people) {
      _people = _.sortBy(people, function(person) {
        return person.user.username;
      });
    },

    getPeople: function() {
      return _people;
    },

    getPerson: function(username) {
      var index = _binarySearchPeople(username);

      return _people[index];
    },

    addPerson: function(person) {
      var people = this.getPeople();
      people.push(person);
      this.setPeople(people);
    },

    removePerson: function(username) {
      var index = _binarySearchPeople(username);

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

  function _binarySearchPeople(username) {
    var list = _.clone(_people);
    var low = 0;
    var length = list.length - 1;

    if (!length) {
      return;
    }

    while (low <= length) {
      var index = Math.floor((low + length) / 2);
      var mid = list[index];

      if (mid.user.username < username) {
        low = index + 1;
      } else if (mid.user.username > username) {
        length = index - 1;
      } else {
        return index;
      }
    }

    return -1;
  }

  return _store;
})();
