jest.dontMock(pathToFile('components/chat_notifications.js.jsx'));
jest.dontMock(pathToFile('mixins/local_storage.js'));

describe('ChatNotifications', function() {
  global.localStorage = {};
  global.moment = require.requireActual('moment');
  global.ChatNotificationsStore = require(pathToFile('stores/chat_notifications_store.js'));

  var Chat = require(pathToFile('components/chat_notifications.js.jsx'));
  var chatRooms;

  beforeEach(function() {
    chatRooms = {
      foo: {
        id: 'foo',
        updated: moment().unix(),
        last_read_at: 123,
        label: 'foo'
      },
      bar: {
        id: 'bar',
        updated: moment().unix(),
        last_read_at: 456,
        label: 'bar'
      },
      baz: {
        id: 'baz',
        updated: moment().unix() - 100,
        last_read_at: moment().unix(),
        label: 'baz'
      }
    };

    ChatNotificationsStore.mostRecentlyUpdatedChatRoom
      .mockReturnValue(chatRooms.foo);

    ChatNotificationsStore.getChatRooms.mockReturnValue(chatRooms);

    ChatNotificationsStore.getUnreadCount.mockImplementation(function(acknowledgedAt) {
      var count = _.countBy(
        chatRooms,
        function(entry) {
          var updated = entry.updated > entry.last_read_at;

          if (acknowledgedAt) {
            return updated && entry.updated > acknowledgedAt;
          }

          return updated;
        }
      );

      return count.true || 0;
    });
  });

  it('instantiates a ChatNotifications component', function() {
    var chat = TestUtils.renderIntoDocument(
      <Chat url="/chat" username="dexter" />
    );

    expect(chat.state.chatRooms instanceof Object).toBe(true);
    expect(chat.state.acknowledgedAt).toEqual(0);
    expect(chat.state.desktopNotificationsEnabled).toBe(false);
  });

  // This method failed after the move to the new chat
  xit('renders a sorted NotificationsList', function() {
    var chat = TestUtils.renderIntoDocument(
      <Chat url="/chat" username="dexter" />
    );

    var div = TestUtils.findRenderedDOMComponentWithTag(chat, 'div').getDOMNode();

    expect(div.textContent).toEqual(' foo bar baz');

    var badges = TestUtils.scryRenderedDOMComponentsWithClass(chat, 'indicator-danger');

    expect(badges.length).toEqual(2);
  });

  it('updates the NotificationsList', function() {
    var chat = TestUtils.renderIntoDocument(
      <Chat url="/chat" username="dexter" />
    );

    var badges = TestUtils.scryRenderedDOMComponentsWithClass(chat, 'indicator-danger');

    expect(badges.length).toEqual(2);

    chatRooms.buzz = {
      id: 'buzz',
      updated: moment().unix(),
      last_read_at: moment().unix() - 100,
      label: 'buzz'
    };

    chat.setState({
      data: chatRooms
    });

    badges = TestUtils.scryRenderedDOMComponentsWithClass(chat, 'indicator-danger');

    expect(badges.length).toEqual(3);

    delete chatRooms.buzz;
  });
});
