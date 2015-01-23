var ActionTypes = window.CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;
var Store = require('./es6_store');

var availableTopics = [];

class IdeaAdminStore extends Store {
  constructor() {
    super();

    Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.IDEA_TOPICS_RECEIVE:
          availableTopics = action.topics;
          this.emitChange();
          break;
      }
    });
  }

  getAvailableTopics() {
    return availableTopics;
  }
};

module.exports = new IdeaAdminStore();
