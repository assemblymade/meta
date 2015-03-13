'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store');

let isModalOpen = false;

class SignupModalStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.SIGNUP_MODAL_CHANGED:
          isModalOpen = action.isModalOpen;
          break;
        default:
          return;
      }

      this.emitChange();
    });
  }

  isModalOpen() {
    return isModalOpen;
  }
};

module.exports = new SignupModalStore();
