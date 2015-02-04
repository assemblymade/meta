var EventEmitter = require('events').EventEmitter;
var CHANGE_EVENT = require('../constants').CHANGE_EVENT;

var Store = _.extend({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// suppress warnings about memory leaks that don't exist
Store.setMaxListeners(0);

module.exports = Store;
