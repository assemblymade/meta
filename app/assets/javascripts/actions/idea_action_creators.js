var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Routes = require('../routes');
var page = require('page');

class IdeaActionCreators {
  showEditIdea(idea) {
    page(idea.path + '/edit');
  }

  submitFirstQuestionClicked(idea) {
    page(idea.path);
  }

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
        page(newIdea.path + '/start-conversation');

        Dispatcher.dispatch({
          type: ActionTypes.IDEAS_NEW_IDEA_CREATED,
          idea: newIdea
        });
      }
    });
  }

  updateIdea(idea) {
    var url = Routes.idea_path({
      id: idea.id
    });

    delete idea.id;

    var data = JSON.stringify({
      idea: idea
    });

    $.ajax({
      url: url,
      method: 'PUT',
      data: data,
      contentType: 'application/json',
      dataType: 'json',
      success: function(idea) {
        if (idea.comments_count && idea.comments_count > 0) {
          page(idea.path);
        } else {
          page(idea.path + '/start-conversation');
        }

        Dispatcher.dispatch({
          type: ActionTypes.IDEA_UPDATED,
          idea: idea
        });
      }
    });
  }
}

module.exports = new IdeaActionCreators()
