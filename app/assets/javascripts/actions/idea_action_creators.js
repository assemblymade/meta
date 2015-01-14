var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;
var Routes = require('../routes');
var page = require('page');

class IdeaActionCreators {
  submitIdeaClicked(idea) {
    var url = Routes.ideas_path();
    var data = JSON.stringify({
      idea: idea
    });

    $.ajax({
      url: url,
      method: 'POST',
      data: data,
      contentType: 'application/json',
      dataType: 'json',
      success: function(newIdea) {
        page(newIdea.url);

        Dispatcher.dispatch({
          type: ActionTypes.IDEAS_NEW_IDEA_CREATED
        });
      }
    });
  }
}

module.exports = new IdeaActionCreators()
