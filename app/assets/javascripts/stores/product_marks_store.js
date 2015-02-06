const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let marks = Immutable.List();

class ProductMarksStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_MARKS_RECEIVE:
          marks = Immutable.List(action.marks);
          this.emitChange();
          break;
      }
    });
  }

  getMarks() {
    return marks.toJS();
  }
};

module.exports = new ProductMarksStore();
