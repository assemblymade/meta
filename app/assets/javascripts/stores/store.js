var Store = _.extend({}, {
  emit: function(event) {
    var callbacks = this.listeners;

    if (!_.isEmpty(callbacks)) {
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i]();
      }
    }
  },

  addChangeListener: function(callback) {
    this.listeners = this.listeners || [];
    this.listeners.push(callback);

    return this.listeners.length - 1;
  },

  removeChangeListener: function(eventIndex) {
    if (this.listeners && this.listeners[eventIndex]) {
      this.listeners.splice(eventIndex, 1);
      return this.listeners.length;
    } else {
      return -1;
    }
  }
});
