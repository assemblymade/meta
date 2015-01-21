var ActionTypes = window.CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;
var Store = require('./es6_store');
var UserStore = require('./user_store');

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
        case ActionTypes.LOVE_CLICKED:
          _setUserLove(action);
          this.emitChange();
          break;
        case ActionTypes.LOVE_UNCLICKED:
          _unsetUserLove(action);
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

function _setUserLove(action) {
  var currentLovers = lovers[action.heartable_id];
  var user = UserStore.getUser();

  if (currentLovers) {
    currentLovers.push(user)
  } else {
    currentLovers = [user];
  }
}

function _unsetUserLove(action) {
  var currentLovers = lovers[action.heartable_id] || [];
  var user = UserStore.getUser();

  for (var i = 0, l = currentLovers.length; i < l; i++) {
    var lover = currentLovers[i];

    if (lover.id === user.id) {
      currentLovers.splice(i, 1);
    }
  }

  lovers[action.heartable_id] = currentLovers;
}
