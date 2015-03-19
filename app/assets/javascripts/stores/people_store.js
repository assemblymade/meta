var Dispatcher = require('../dispatcher');
var Store = require('./store');
var ActionTypes = require('../constants').ActionTypes;

var _people = {};

var _store = Object.create(Store);
var _peopleStore = _.extend(_store, {
  destroy: function() {
    Dispatcher.remove(dispatchToken);
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

  getById: function(id) {
    return _people[id]
  },

  getPeopleWithoutGroups: function() {
    return _(_.values(_people)).filter(u => u.avatar_url) // group users like @core don't have avatars
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

_store.dispatchToken = Dispatcher.register(function(payload) {
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

    case ActionTypes.HEARTS_STORIES_RECEIVE:
      _(payload.users).each(user => {
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

module.exports = window.PeopleStore = _peopleStore;
