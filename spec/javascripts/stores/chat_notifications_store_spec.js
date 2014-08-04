//= require spec_helper
/**
 * This `require moment` statement sort of points
 * to how weird and potentially harmful the Asset Pipeline's
 * idea of JavaScript dependencies is. Can we find a way
 * to decouple the front end application from the server?
 * At the moment, we're really dependent on how Rails decides
 * to server up the JavaScript -- with a lot of global muck. /rant
 */
//= require moment
//= require underscore
//= require react
//= require components

fixture.preload('readraptor_meta_tag.html');

describe('ChatNotificationsStore', function() {
  var _app;
  before(function() {
    this.fixture = fixture.load('readraptor_meta_tag.html', true);
    _app = window.app;

    window.app = {
      currentUser: function() {
        return {
          get: function(property) {
            return 'pizza';
          }
        }
      }
    };
  });

  after(function() {
    window.app = _app;
  });

  it('marks a room as read', function() {
    var spy = sinon.spy(ChatNotificationsStore, 'emit');
    sinon.stub(window.xhr, 'noCsrfRequest', function(method, path, data, callback) {
      return true;
    });

    ChatNotificationsStore['chat:markRoomAsRead']({ id: 123, readraptor_url: '/clever_girl' });

    expect(spy.calledOnce).to.be.true;
    window.xhr.noCsrfRequest.restore();
    ChatNotificationsStore.emit.restore();
  });

  it('fetches the chat rooms', function() {
    var spy = sinon.spy(ChatNotificationsStore, 'emit');
    var request = sinon.stub(window.xhr, 'request', function(method, path, data, callback) {
      var chat_rooms = [
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 3
        },
        {
          id: 4
        }
      ];

      return callback(null, JSON.stringify({ chat_rooms: chat_rooms }));
    });

    var noCsrfRequest = sinon.stub(window.xhr, 'noCsrfRequest', function(method, path, data, callback) {
      var readraptorData = [
        {
          key: 1,
          last_read_at: 123
        },
        {
          key: 2,
          last_read_at: 123
        }
      ];

      return callback(null, JSON.stringify(readraptorData));
    });

    ChatNotificationsStore['chat:fetchChatRooms']('/chat');

    expect(request.calledOnce).to.be.true;
    expect(noCsrfRequest.calledOnce).to.be.true;
    expect(spy.calledOnce).to.be.true;

    window.xhr.request.restore();
    window.xhr.noCsrfRequest.restore();
    ChatNotificationsStore.emit.restore();
  });

  it('gets the unread chat count', function() {
    var chatRooms = [
      {
        updated: 123
      },
      {
        updated: 789
      },
      {
        updated: 456
      }
    ];

    ChatNotificationsStore.setChatRooms(chatRooms);

    expect(ChatNotificationsStore.getUnreadCount(555)).to.equal(1);

    ChatNotificationsStore.removeAllChatRooms();
  });
});
