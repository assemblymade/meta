var Dispatcher = require('../dispatcher');
var Store = require('./store');
var ActionTypes = require('../constants').ActionTypes;

var _people = {};

var _store = Object.create(Store);
var _peopleStore = _.extend(_store, {
  destroy: function() {
    Dispatcher.remove(dispatchIndex);
  },

  // TODO: remove this, stores shouldn't have setters
  setPeople: function(people) {
    _people = _(people).reduce(function(memo, user){ memo[user.id] = user; return memo}, {})
  },

  filterByUsername: function(partial) {
    return _(_people).filter(function(user){
      return user.username.toLowerCase().indexOf((partial || '').toLowerCase()) != -1
    })
  },

  getPeople: function() {
    return _.values(_people);
  },

  getPerson: function(username) {
    return _searchPeople(username);
  },

  addPerson: function(data) {
    _people[data.user.id] = data.user;

    return this.getPeople();
  },

  removePerson: function(username) {
    var user = _searchPeople(username);

    delete _people[user.id]

    return this.getPeople();
  }
});

_store.dispatchIndex = Dispatcher.register(function(payload) {
  var action = payload.action;
  var data = payload.data;

  _store[action] && _store[action](data);
  _store.emitChange();

  switch(payload.type) {
    case ActionTypes.PEOPLE_RECEIVE:
      _(payload.people).each(function(user){
        _people[user.id] = user
      })
      _peopleStore.emitChange();
      break;
  }
});

function _searchPeople(username) {
  return _(_people).find(function(user) { return user.username == username })
}

var dataTag = document.getElementById('PeopleStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.PEOPLE_RECEIVE,
    people: JSON.parse(dataTag.innerHTML)
  })
}


module.exports = _peopleStore;
window.PeopleStore = _peopleStore;
