var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('./store');

(function() {
  var _interests = ['code', 'design'];

  var _store = Object.create(Store);

  var _interestStore = _.extend(_store, {
    addInterest: function(interest) {
      if (!interest) {
        return;
      }

      if (_interests.indexOf(interest) !== -1) {
        return;
      }

      _interests.push(interest);
    },

    getInterests: function() {
      return _interests;
    },

    removeInterest: function(interest) {
      var index = _interests.indexOf(interest);

      if (index >= 0) {
        _interests.splice(index, 1);
      }
    },

    pop: function() {
      _interests.pop();
    },

    setInterests: function(interests) {
      _interests = interests;
    },

    removeAllInterests: function() {
      _interests = ['code', 'design'];
    }
  });

  _store.dispatchToken = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    _store[action] && _store[action](data);
    _store.emitChange();
  });

  if (typeof module !== 'undefined') {
    module.exports = _interestStore;
  }

  window.InterestStore = _interestStore;
})();
