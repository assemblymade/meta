'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store');

let errors = {};

class SignupFormStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.SIGNUP_ERRORS:
          errors = action.errors;
          break;
        default:
          return;
      }

      this.emitChange();
    });
  }

  getErrors() {
    let e = _.clone(errors);
    errors = {};

    return e;
  }
};

module.exports = new SignupFormStore();
