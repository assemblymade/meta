var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store');

var sharePanelOpen = false;

class IdeaSharePanelStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.LOVE_CLICKED:
          sharePanelOpen = true;
          this.emitChange();
          break;
        case ActionTypes.LOVE_UNCLICKED:
          sharePanelOpen = false;
          this.emitChange();
          break;
      }
    });
  }

  isDrawerOpen() {
    return sharePanelOpen;
  }
}

module.exports = new IdeaSharePanelStore();
