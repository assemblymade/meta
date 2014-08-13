jest.dontMock(pathToFile('stores/chat_notifications_store'));

describe('ChatNotificationsStore', function() {
  var xhr = require(pathToFile('xhr.js'));
  var ChatNotificationsStore = require(pathToFile('stores/chat_notifications_store'));

  global.moment = require.requireActual('moment');
  global.app = {
    currentUser: function() {
      return {
        get: function(property) {
          return 'pizza';
        }
      }
    }
  };

  beforeEach(function() {
    var chatRooms = {
      123: {
        id: 123,
        readraptor_url: '/clever_girl'
      },
      789: {
        updated: 789,
        last_read_at: 123
      },
      456: {
        updated: 456,
        last_read_at: 123
      }
    }
    ChatNotificationsStore.setStories(chatRooms);
  });

  afterEach(function() {
    ChatNotificationsStore.removeAllChatRooms();
  });

  describe('chat:markRoomAsRead()', function() {
    it('marks a room as read', function() {
      ChatNotificationsStore['chat:markRoomAsRead']({ id: 123, readraptor_url: '/clever_girl' });

      expect(xhr.noCsrfGet).toBeCalled();

      expect(ChatNotificationsStore.getChatRoom(123).last_read_at).toBeCloseTo(moment().unix(), 2);
    });
  });

  describe('chat:fetchChatRooms()', function() {
    it('fetches the chat rooms', function() {
      ChatNotificationsStore['chat:fetchChatRooms']('/chat');

      expect(xhr.get).toBeCalled();
      expect(xhr.noCsrfGet).toBeCalled();
    });
  });

  describe('getUnreadCount()', function() {
    it('gets the unread chat count', function() {
      expect(ChatNotificationsStore.getUnreadCount(555)).toEqual(1);
    });
  });
});
