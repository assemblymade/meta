var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');
var CHANGE_EVENT = require('../constants').CHANGE_EVENT;

(function() {
  var Store = merge(EventEmitter.prototype, {
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

  if (typeof module !== 'undefined') {
    module.exports = Store;
  }

  window.Store = Store;
})();
