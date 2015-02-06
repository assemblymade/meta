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
          marks = [];
          _setMarks(action);
          this.emitChange();
          break;
      }
    });
  }

  getMarks() {
    return marks.toJS();
  }

  getMarkNames() {
    return marks.map((mark) => {
      return mark[1];
    }).toJS();
  }
};

module.exports = new BountyMarksStore();

function _setMarks(action) {
  let m = action.marks;
  let _marks = [];

  for (var name in m) {
    _marks.push([name, m[name]]);
  }

  marks = Immutable.List(_marks);
}
