var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');

var PostActionCreators = {
  fetchPosts: function(path) {
    $.ajax({
      method: 'GET',
      url: path,
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.POSTS_RECEIVE,
          posts: data.posts
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  }
};

module.exports = PostActionCreators;
