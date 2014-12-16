var ActionTypes = window.CONSTANTS.ActionTypes;
var Routes = require('../routes');

var PostActionCreators = {
  archive: function(productSlug, postId) {
    var url = Routes.product_post_path({
      product_id: productSlug,
      id: postId
    });

    $.ajax({
      url: url,
      method: 'DELETE',
      headers: {
        accept: 'application/json'
      },
      success: function() {
        Dispatcher.dispatch({
          type: ActionTypes.POST_ARCHIVED,
          postId: postId
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  },

  unarchive: function(productSlug, postId) {
    var url = Routes.product_post_path({
      product_id: productSlug,
      id: postId
    }) + '/unarchive';

    $.ajax({
      url: url,
      method: 'PATCH',
      success: function() {
        Dispatcher.dispatch({
          type: ActionTypes.POST_UNARCHIVED,
          postId: postId
        });
      },
      error: function() {}
    });
  }
};

module.exports = PostActionCreators;
