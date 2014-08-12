var xhr = require('../xhr');
var merge = require('react/lib/merge');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _store = Object.create(Store);

  var _buttonStore = _.extend(_store, {
    'toggleButton:click': function(url) {
      xhr.patch(url);
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emitChange(event);
  });

  if (typeof module !== 'undefined') {
    module.exports = _buttonStore;
  }

  window.ButtonStore = _buttonStore;
})();
