'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store');

var errors = {}
var pendingAward = null

class SignupFormStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.SIGNUP_ERRORS:
          errors = action.errors
          break;
        case ActionTypes.PENDING_AWARD_RECEIVE:
          pendingAward = action.award
          break
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

  getPendingAward() {
    return pendingAward
  }
};

var store = new SignupFormStore()
var dataTag = document.getElementById('SignupFormStore')
if (dataTag) {
  var data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.PENDING_AWARD_RECEIVE,
    award: data.pending_award
  });
}

module.exports = store
