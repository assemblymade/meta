/**
 * Prefer this Es6Store superclass for new stores. Eventually migrate existing
 * stores to this model and change its name to simple Store.
 */

var EventEmitter = require('events').EventEmitter
var CHANGE_EVENT = window.CONSTANTS.CHANGE_EVENT

class Es6Store extends EventEmitter {
  constructor() {
    super()

    this.setMaxListeners(0)
  }

  emitChange() {
    this.emit(CHANGE_EVENT)
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback)
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }
}

module.exports = Es6Store;
