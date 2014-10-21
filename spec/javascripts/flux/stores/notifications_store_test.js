describe('NotificationsStore', function() {
  var NotificationsStore = require.requireActual(pathToFile('stores/notifications_store'));
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

  describe('notifications:fetchStories()', function() {
    it('fetches stories', function() {
      NotificationsStore['notifications:fetchStories']('/rex');
      expect(xhr.get).toBeCalledWith('/rex', NotificationsStore.handleReadRaptor);
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

      NotificationsStore.setStories(stories);

      expect(NotificationsStore.getUnreadCount(555)).toEqual(1);
    });
  });
});
