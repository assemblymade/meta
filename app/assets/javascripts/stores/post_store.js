'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let post = Immutable.Map();

class PostStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.POST_RECEIVE:
          post = Immutable.Map(action.post);
          this.emitChange();
          break;
      }
    });
  }

  getPost() {
    return post.toJS();
  }
};

module.exports = new PostStore();
