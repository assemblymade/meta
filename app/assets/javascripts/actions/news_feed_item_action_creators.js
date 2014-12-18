var ActionTypes = window.CONSTANTS.ActionTypes;
var Routes = require('../routes');

var NewsFeedItemActionCreators = {
  archive: function(productSlug, itemId) {
    request(
      ActionTypes.NEWS_FEED_ITEM_ARCHIVED,
      productSlug,
      itemId,
      new Date()
    );
  },

  unarchive: function(productSlug, itemId) {
    request(
      ActionTypes.NEWS_FEED_ITEM_UNARCHIVED,
      productSlug,
      itemId,
      null
    );
  }
};

function request(action, productSlug, itemId, archivedAt) {
  var url = Routes.product_update_path({
    product_id: productSlug,
    id: itemId
  });

  $.ajax({
    url: url,
    method: 'PATCH',
    json: true,
    data: {
      news_feed_item: {
        archived_at: archivedAt
      }
    },
    success: function() {
      Dispatcher.dispatch({
        type: action,
        itemId: itemId
      });
    },
    error: function(jqXhr, textStatus, error) {
      console.log(error);
    }
  });
}

module.exports = NewsFeedItemActionCreators;
