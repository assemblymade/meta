var ActionTypes = window.CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;
var Store = require('./es6_store');

var lovers = {};

class LoversStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.LOVERS_RECEIVE:
          _setLovers(action);
          this.emitChange();
          break;
      }
    });
  }

  getLovers(heartableId) {
    return lovers[heartableId] || [];
  }
};

module.exports = new LoversStore();

function _setLovers(action) {
  lovers[action.heartableId] = action.lovers;
}
