//= require dispatcher
//= require stores/store

var NewsFeedUsersStore = (function() {
  var _users = [];

  var _store = Object.create(Store);

  var _newsFeedUsersStore = _.extend(_store, {
    setUsers: function(users) {
      _users = users;
    },

    getUsers: function(){
      return _users;
    },

    removeAllUsers: function() {
      _users = [];
    }
  });

  return _newsFeedUsersStore;
})();
