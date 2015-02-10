'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

let currentlyEditingTitle = null;
let subsections = Immutable.Map();

class ProductSubsectionsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_SUBSECTIONS_RECEIVE:
          subsections = Immutable.Map(action.subsections);
          this.emitChange();
          break;
        case ActionTypes.PRODUCT_SUBSECTION_EDITING:
          currentlyEditingTitle = action.title;
          this.emitChange();
          break;
        case ActionTypes.PRODUCT_SUBSECTION_SUBMIT:
          subsections = subsections.set(action.title, action.body);
          this.emitChange();
          break;
        case ActionTypes.PRODUCT_SUBSECTIONS_SUBMITTED:
          currentlyEditingTitle = null
          subsections = Immutable.Map(action.subsections);
          this.emitChange();
          break;
      }
    });
  }

  isEditing(title) {
    return currentlyEditingTitle === title;
  }

  getSubsections() {
    return subsections.toJS();
  }
};

module.exports = new ProductSubsectionsStore();
