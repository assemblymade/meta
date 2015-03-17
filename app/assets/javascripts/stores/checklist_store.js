'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Store = require('./es6_store')

var _checklists;

class ChecklistStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.CHECKLIST_ITEMS_RECEIVE:
          _checklists = action.checklists
          console.log('setting _checklists', [_checklists, action.checklists])
          this.emitChange()
          break
      }
    })
  }

  fetchChecklistItems(){
    console.log('tried to fetch', _checklists)
    return _checklists
  }

}

module.exports = new ChecklistStore;
