var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')
var StoryActions = require('../actions/story_actions')
var UserStore = require('./user_store')

var _dispatchToken,
    _checklists

class ChecklistStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.CHECKLIST_CHANGE:
          ChecklistActions.fetchIdeaChecklists(action.idea_name)
          this.emitChange()
      }
    })
  }

  getChecklistItems() {
    return _checklists
  }

}

module.exports = new ChecklistStore;
