var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

var ChecklistActions = {

  fetchChecklists: function(entity) {
    var options = {}
    if(entity.type === "idea") {
      $.ajax({
        url: "/ideas/" + entity.id + "/checklistitems",
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
    else {
      $.ajax({
        url: "/products/" + entity.id + "/checklistitems",
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
}

module.exports = ChecklistActions
