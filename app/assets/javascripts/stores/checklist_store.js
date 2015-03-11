var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')
var StoryActions = require('../actions/story_actions')
var UserStore = require('./user_store')

var _dispatchToken,
    _more = true,
    _stories = null

var _readStateReadAt = null

class ChecklistStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.CHECKLIST_CHANGE:
          ChecklistActions.fetchChecklists()
          this.emitChange()
      }
    })
  }

  getChecklistItems() {
    return _more
  }

}

module.exports = new ChecklistStore()
