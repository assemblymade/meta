var _callbacks = [];

var Dispatcher = _.extend(Function.prototype, {
  register: function(callback) {
    _callbacks.push(callback);

    // Returning the callback's index allows
    // explicit references to the callback
    // outside of the dispatcher
    return _callbacks.length - 1;
  },

  dispatch: function(payload) {
    if (!_callbacks.length) {
      return;
    }

    for (var i = 0, l = _callbacks.length; i < l; i++) {
      _callbacks[i](payload);
    }
  }
});
