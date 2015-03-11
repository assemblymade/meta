var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('./store');

(function() {
  var _store = Object.create(Store);

  var _buttonStore = _.extend(_store, {
    'toggleButton:click': function(url) {
      xhr.patch(url);
    }
  });

  _store.dispatchToken = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    _store[action] && _store[action](data);
    _store.emitChange();
  });

  if (typeof module !== 'undefined') {
    module.exports = _buttonStore;
  }

  window.ButtonStore = _buttonStore;
})();
