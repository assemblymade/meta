'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store')

let _checklists;

class ChecklistStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.CHECKLIST_ITEMS_RECEIVE:
          _checklists = action.checklists
          this.emitChange()
          break
      }
    })
  }

  fetchChecklistItems(){
    return _checklists
  }

}

module.exports = new ChecklistStore;
