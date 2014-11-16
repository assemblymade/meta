//= require constants

// This dispatcher modifies some of the ideas in Facebook's template:
// https://github.com/facebook/flux/blob/master/src/Dispatcher.js

(function() {
  // Sprockets. Booooo.
  // var PayloadSources = require('./constants').PayloadSources
  var PayloadSources = window.CONSTANTS.PayloadSources

  /** Private variables */

  var _prefix = 'asm_';
  var _lastId = 0;
  var _callbacks = {};
  var _isPending = {};
  var _isHandled = {}
  var _isDispatching = false;
  var _pendingPayload = null;


  /** Private methods */

  function _invokeCallback(id) {
    _isPending[id] = true;
    _callbacks[id](_pendingPayload);
    _isHandled[id] = true;
  }

  function _startDispatching(payload) {
    for (var i in _callbacks) {
      _isPending[i] = false;
      _isHandled[i] = false;
    }

    _pendingPayload = payload;
    _isDispatching = true;
  }

  function _stopDispatching() {
    _pendingPayload = null;
    _isDispatching = false;
  }


  /** Dispatcher */

  var Dispatcher = _.extend(Function.prototype, {
    handleServerAction: function(action) {
      var payload = {
        source: PayloadSources.SERVER_ACTION,
        action: action
      };
      this.dispatch(payload);
    },

    handleViewAction: function(action) {
      var payload = {
        source: PayloadSources.VIEW_ACTION,
        action: action
      };
      this.dispatch(payload);
    },

    dispatch: function(payload) {
      if (_.isEmpty(_callbacks)) {
        return;
      }

      if (this.isDispatching()) {
        console.warn('Cannot dispatch in the middle of another dispatch');
        return;
      }

      _startDispatching(payload);

      try {
        for (var id in _callbacks) {
          if (_isPending[id]) {
            continue;
          }

          _invokeCallback(id)
        }
      } finally {
        _stopDispatching();
      }
    },

    isDispatching: function() {
      return _isDispatching;
    },

    register: function(callback) {
      var id = _prefix + (_lastId++);

      _callbacks[id] = callback;

      return id;
    },

    remove: function(id) {
      return delete _callbacks[id];
    },

    removeAll: function() {
      _callbacks = {};
    },

    waitFor: function(ids) {
      // if we only need to wait for one other callback,
      // we can just pass that single id in
      if (!(ids instanceof Array)) {
        ids = [ids];
      }

      for (var i = 0, l = ids.length; i < l; i++) {
        var id = ids[i];

        if (_callbacks[id]) {
          if (_isPending[id]) {
            console.warn('Dispatcher.waitFor() detected a circular dependency while waiting for ' + _callbacks[i].toString());
            continue;
          }

          _invokeCallback(id);
        }
      }
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Dispatcher;
  }

  window.Dispatcher = Dispatcher;
})();
