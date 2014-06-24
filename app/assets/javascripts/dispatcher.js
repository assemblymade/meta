var Dispatcher = _.extend(Function.prototype, {
  register: function(callback) {
    this._callbacks = this._callbacks || [];

    this._callbacks.push(callback);

    // Returning the callback's index allows
    // explicit references to the callback
    // outside of the dispatcher
    return this._callbacks.length - 1;
  },

  dispatch: function(payload) {
    var callbacks = this._callbacks;

    if (!callbacks.length) {
      return;
    }

    for (var i = 0, l = callbacks.length; i < l; i++) {
      callbacks[i](payload);
    }
  },

  remove: function(index) {
    if (this._callbacks[index]) {
      this._callbacks.splice(index, 1);
      return true;
    }

    return false;
  }
});
