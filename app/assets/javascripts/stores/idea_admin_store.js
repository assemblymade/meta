var ActionTypes = window.CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;
var Store = require('./es6_store');

var availableTopics = [];
var availableCategories = [];

class IdeaAdminStore extends Store {
  constructor() {
    super();

    Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.IDEA_ADMIN_RECEIVE:
          availableCategories = action.categories;
          availableTopics = action.topics;
          this.emitChange();
          break;
      }
    });
  }

  getAvailableCategories() {
    return availableCategories;
  }

  getAvailableTopics() {
    return availableTopics;
  }
};

module.exports = new IdeaAdminStore();
