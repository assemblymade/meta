//= require underscore

var Dispatcher = (function() {
  var _callbacks = [];

  return _.extend(Function.prototype, {
    register: function(callback) {
      _callbacks.push(callback);

      // Returning the callback's index allows
      // explicit references to the callback
      // outside of the dispatcher
      return _callbacks.length - 1;
    },

    dispatch: function(payload) {
      if (_.isEmpty(_callbacks)) {
        return;
      }

      for (var i = 0, l = _callbacks.length; i < l; i++) {
        _callbacks[i](payload);
      }
    },

    remove: function(index) {
      if (_callbacks[index]) {
        _callbacks.splice(index, 1);
        return true;
      }

      return false;
    },

    removeAll: function() {
      _callbacks = [];
    }
  });
})();
