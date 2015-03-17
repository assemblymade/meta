var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('./store');

(function() {
  var _contracts = {};
  var _store = Object.create(Store);

  var _contractStore = _.extend(_store, {
    addContract: function(contract) {
      _contracts[contract.id] = contract;
    },

    getAvailablePercentage: function(start) {
      var available = 100 + parseFloat(start);

      for (var c in _contracts) {
        available -= _contracts[c].amount;
      }

      return available;
    },

    getContracts: function() {
      return _contracts;
    },

    removeContract: function(contractId) {
      return delete _contracts[contractId];
    },

    updateContract: function(contract) {
      this.addContract(contract);
    }
  });

  _store.dispatchToken = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    _store[action] && _store[action](data);
    _store.emitChange();
  });

  if (typeof module !== 'undefined') {
    module.exports = _contractStore;
  }

  window.ContractStore = _contractStore;
})();
