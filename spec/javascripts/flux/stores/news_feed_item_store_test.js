jest.dontMock(pathToFile('stores/news_feed_item_store'));

var ActionTypes = global.CONSTANTS.ActionTypes;

describe('NewsFeedItemStore', function() {
  var callback;
  var NewsFeedItemStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    NewsFeedItemStore = require(pathToFile('stores/news_feed_item_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('optimisticallyAddComment()', function() {
    it('adds a comment optimistically', function() {
      callback({
        type: ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT,
        data: {
          body: 'Yo yo yo',
          created_at: Date.now(),
          news_feed_item_id: 'thread',
          user: { username: 'Mr. T' }
        }
      });

      expect(NewsFeedItemStore.getComments('thread').optimistic[0].body).toEqual('Yo yo yo');
    });
  });

  describe('confirmComment()', function() {
    it('erases the optimistic comment', function() {
      var timestamp = Date.now();

      callback({
        type: ActionTypes.NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT,
        data: {
          body: 'Yo yo yo',
          created_at: timestamp,
          news_feed_item_id: 'thread',
          user: { username: 'Mr. T' }
        }
      });

      expect(NewsFeedItemStore.getComments('thread').optimistic[0].body).toEqual('Yo yo yo');

      callback({
        type: ActionTypes.NEWS_FEED_ITEM_CONFIRM_COMMENT,
        data: {
          thread: 'thread',
          timestamp: timestamp,
          comment: {
            body: 'Yo yo yo',
            created_at: timestamp,
            news_feed_item_id: 'thread',
            user: { username: 'Mr. T' }
          }
        }
      });

      var comments = NewsFeedItemStore.getComments('thread');

      expect(comments.optimistic[0]).toBeUndefined();
    });
  });
});
