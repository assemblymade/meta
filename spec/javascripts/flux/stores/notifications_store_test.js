describe('NotificationsStore', function() {
  var NotificationsStore;
  var xhr;
  var app = {
    currentUser: function() {
      return {
        get: function(property) {
          return 'pizza';
        }
      }
    }
  };

  beforeEach(function(){
    Dispatcher = require(appFile('dispatcher'))
    NotificationsStore = require.requireActual(pathToFile('stores/notifications_store'));
    xhr = require(pathToFile('xhr'));
  })

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
          updated_at: 123,
          last_read_at: 123
        },
        {
          updated_at: 789,
          last_read_at: 123
        },
        {
          updated_at: 456,
          last_read_at: 123
        }
      ];

      NotificationsStore.setStories(stories);

      expect(NotificationsStore.getUnreadCount(555)).toEqual(1);
    });
  });
});
