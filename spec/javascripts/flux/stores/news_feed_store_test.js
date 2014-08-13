jest.dontMock(pathToFile('stores/news_feed_store'));

describe('NewsFeedStore', function() {
  var NewsFeedStore = require(pathToFile('stores/news_feed_store'));
  var xhr = require(pathToFile('xhr'));
  var app = {
    currentUser: function() {
      return {
        get: function(property) {
          return 'pizza';
        }
      }
    }
  };

  describe('newsFeed:fetchStories()', function() {
    it('fetches stories', function() {
      NewsFeedStore['newsFeed:fetchStories']('/rex');
      expect(xhr.get).toBeCalledWith('/rex', NewsFeedStore.handleReadRaptor);
    });
  });

  describe('getUnreadCount()', function() {
    it('returns the number of unread stories', function() {
      var stories = [
        {
          updated: 123,
          last_read_at: 123
        },
        {
          updated: 789,
          last_read_at: 123
        },
        {
          updated: 456,
          last_read_at: 123
        }
      ];

      NewsFeedStore.setStories(stories);

      expect(NewsFeedStore.getUnreadCount(555)).toEqual(1);
    });
  });
});
