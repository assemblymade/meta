'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let marks = Immutable.List();

class BountyMarksStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.BOUNTY_MARKS_RECEIVE:
          marks = Immutable.List(action.marks)
          break;
        default:
         return;
      }

      this.emitChange();
    });
  }

  getMarks() {
    return marks;
  }
};

module.exports = new BountyMarksStore();
