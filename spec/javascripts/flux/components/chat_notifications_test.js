/** @jsx React.DOM */

jest.dontMock(pathToFile('components/chat_notifications.js.jsx'));
jest.dontMock(pathToFile('mixins/local_storage.js'));

describe('ChatNotifications', function() {
  global.localStorage = {};
  global.moment = require.requireActual('moment');
  global.Spinner = require.requireActual('spin.js');
  global.Dispatcher = require(pathToFile('dispatcher.js'));
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

    // Not sure if this kind of mock is an antipattern.
    // Having to do this to get tests to pass might suggest that
    // we need to move the getUnreadCount functions to the components
    // rather than keeping them in the store.
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

    expect(chat.state.data instanceof Object).toBe(true);
    expect(chat.state.acknowledgedAt).toEqual(0);
    expect(chat.state.desktopNotificationsEnabled).toBe(false);
  });

  it('renders a sorted NotificationsList', function() {
    var chat = TestUtils.renderIntoDocument(
      <Chat url="/chat" username="dexter" />
    );

    var div = TestUtils.findRenderedDOMComponentWithTag(chat, 'div').getDOMNode();

    expect(div.textContent).toEqual(' bar foo baz');

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
