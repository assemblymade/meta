jest.dontMock(pathToFile('stores/archived_news_feed_items_store'));

var ActionTypes = global.CONSTANTS.ActionTypes;

describe('ArchivedNewsFeedItemsStore', function(){
  var callback;
  var ArchivedNewsFeedItemsStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    ArchivedNewsFeedItemsStore = require(pathToFile('stores/archived_news_feed_items_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('isArchived()', function() {
    it('keeps track of archived items', function() {
      callback({
        type: ActionTypes.NEWS_FEED_ITEM_ARCHIVED,
        itemId: 'foo'
      });

      expect(ArchivedNewsFeedItemsStore.isArchived('foo')).toBe(true);
      expect(ArchivedNewsFeedItemsStore.isArchived('bar')).toBe(false);
    });
  });
});
