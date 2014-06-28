var Store = _.extend(Function.prototype, {
  emit: function(event) {
    var callbacks = this.listeners && this.listeners[event];

    if (!_.isEmpty(callbacks)) {
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i]();
      }
    }
  },

  addChangeListener: function(event, callback) {
    this.listeners = this.listeners || {};
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);

    return this.listeners[event].length - 1;
  },

  removeChangeListener: function(event, eventIndex) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].splice(index, 1);
      return this.listeners[event].length;
    } else {
      return -1;
    }
  }
});
