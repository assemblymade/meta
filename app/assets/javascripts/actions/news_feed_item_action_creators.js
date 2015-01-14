var ActionTypes = window.CONSTANTS.ActionTypes;
var Routes = require('../routes');

var NewsFeedItemActionCreators = {
  archive: function(productSlug, itemId) {
    archiveRequest(
      ActionTypes.NEWS_FEED_ITEM_ARCHIVED,
      productSlug,
      itemId,
      new Date()
    );
  },

  subscribe: function(productSlug, itemId) {
    subscribe(
      productSlug,
      itemId
    );
  },

  unarchive: function(productSlug, itemId) {
    archiveRequest(
      ActionTypes.NEWS_FEED_ITEM_UNARCHIVED,
      productSlug,
      itemId,
      null
    );
  },

  unsubscribe: function(productSlug, itemId) {
    unsubscribe(
      productSlug,
      itemId
    );
  }
};

function archiveRequest(action, productSlug, itemId, archivedAt) {
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

function subscribeRequest(itemId, action, url) {
  $.ajax({
    url: url,
    method: 'PATCH',
    json: true,
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

function subscribe(productSlug, itemId) {
  var action = ActionTypes.NEWS_FEED_ITEM_SUBSCRIBED;
  var url = Routes.product_update_subscribe_path({
    product_id: productSlug,
    update_id: itemId
  });

  subscribeRequest(itemId, action, url);
}

function unsubscribe(productSlug, itemId) {
  var action = ActionTypes.NEWS_FEED_ITEM_UNSUBSCRIBED;
  var url = Routes.product_update_unsubscribe_path({
    product_id: productSlug,
    update_id: itemId
  });

  subscribeRequest(itemId, action, url);
}

module.exports = NewsFeedItemActionCreators;
