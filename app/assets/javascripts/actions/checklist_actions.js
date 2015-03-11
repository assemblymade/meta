var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

var ChecklistActions = {

  fetchIdeaChecklists: function(idea) {
    var options = {}

    $.ajax({
      url: "/ideas/"+idea.name+"/checklistitems",
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.CHECKLIST_CHANGE,
          checklists: data
        })
      }
    })
  }
}

module.exports = ChecklistActions
