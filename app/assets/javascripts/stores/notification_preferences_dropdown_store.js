var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  var _selected;

  var _store = Object.create(Store);

  var _dropdownStore = _.extend(_store, {
    updateSelected: function(data) {
      if (!data) {
        return;
      }

      var item = data.item;
      var path = data.path;

      window.xhr.post(path, {}, function(){
        if (data.redirectTo) {
          app.redirectTo(data.redirectTo)
        }
      });

      _selected = item;
    },

    getSelected: function() {
      return _selected;
    },

    setSelected: function(item) {
      _selected = item;
    },

    removeSelected: function() {
      _selected = undefined;
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    if (!_store[action]) {
      return;
    }

    _store[action] && _store[action](data);
    _store.emitChange();
  });

  if (typeof module !== 'undefined') {
    module.exports = _dropdownStore;
  }

  window.NotificationPreferencesDropdownStore = _dropdownStore;
})();
