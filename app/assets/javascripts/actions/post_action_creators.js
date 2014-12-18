var ActionTypes = window.CONSTANTS.ActionTypes;

var PostActionCreators = {
  fetchPosts: function(path, productSlug) {
    $.ajax({
      method: 'GET',
      url: path,
      success: function(posts) {
        Dispatcher.dispatch({
          type: ActionTypes.POSTS_RECEIVE,
          posts: posts,
          product: productSlug
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  }
};

module.exports = PostActionCreators;
