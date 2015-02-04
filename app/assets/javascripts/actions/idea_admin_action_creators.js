var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Routes = require('../routes');

var IdeaAdminActionCreators = {
  updateIdea: _.debounce(function(idea) {
    var url = Routes.idea_path({
      id: idea.id
    });

    delete idea.id;

    $.ajax({
      url: url,
      method: 'PATCH',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(idea),
      success: function(idea) {
        Dispatcher.dispatch({
          type: ActionTypes.IDEA_UPDATED,
          idea: idea
        });
      }
    });
  }, 500)
};

module.exports = IdeaAdminActionCreators;
