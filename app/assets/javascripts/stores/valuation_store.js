'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let valuation = Immutable.Map();

class ValuationStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.VALUATION_RECEIVE:
          valuation = Immutable.Map(action.valuation);
          this.emitChange();
          break;
      }
    });
  }

  getValuation() {
    return valuation.toJS();
  }
};

module.exports = new ValuationStore();
