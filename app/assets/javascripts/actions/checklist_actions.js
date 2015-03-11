var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var routes = require('../routes');

var ChecklistActions = {

  fetchChecklists: function(product) {
    var options = {}

    $.ajax({
      url: "/"+product.name+"/checklist",
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
