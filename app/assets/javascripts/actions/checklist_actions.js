var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

var ChecklistActions = {

  fetchIdeaChecklists: function(idea_id) {
    var options = {}

    $.ajax({
      url: "/ideas/"+idea_id+"/checklistitems",
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.CHECKLIST_ITEMS_RECEIVE,
          checklists: data
        })
      }
    })
  }
}

module.exports = ChecklistActions
