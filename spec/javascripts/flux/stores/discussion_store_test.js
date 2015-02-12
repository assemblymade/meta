jest.dontMock(pathToFile('stores/discussion_store'));

var ActionTypes = require(appFile('constants')).ActionTypes;

describe('DiscussionStore', function() {
  var callback;
  var DiscussionStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    DiscussionStore = require(pathToFile('stores/discussion_store'));
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

      expect(DiscussionStore.getComments('thread').optimistic[0].body).toEqual('Yo yo yo');
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

      expect(DiscussionStore.getComments('thread').optimistic[0].body).toEqual('Yo yo yo');

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

      var comments = DiscussionStore.getComments('thread');

      expect(comments.optimistic[0]).toBeUndefined();
    });
  });
});
