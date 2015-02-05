const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store');

let introduction = '';

class IntroductionStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.INTRODUCTION_UPDATE:
          introduction = action.introduction;
          this.emitChange();
          break;
      }
    });
  }

  getIntroduction() {
    return introduction || '';
  }
};

module.exports = new IntroductionStore();
