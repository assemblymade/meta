jest.dontMock(pathToFile('components/chat_notifications_toggler.js.jsx'));
jest.dontMock(pathToFile('mixins/dropdown_toggler.js.jsx'));
jest.dontMock(pathToFile('mixins/local_storage.js'));

describe('ChatNotificationsToggler', function() {
  var chatRooms;
  var Toggler;
  var ChatNotificationsStore;

  beforeEach(function() {
    global.localStorage = {};
    global.moment = require.requireActual('moment');
    global.Dispatcher = require(pathToFile('dispatcher.js'));

    Toggler = require(pathToFile('components/chat_notifications_toggler.js.jsx'));
    ChatNotificationsStore = require(pathToFile('stores/chat_notifications_store.js'));

    chatRooms = {
      foo: {
        updated: moment().unix(),
        last_read_at: 123
      },
      bar: {
        updated: moment().unix(),
        last_read_at: 123
      },
      baz: {
        updated: moment().unix() - 100,
        last_read_at: moment().unix()
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

  it('instantiates a dropdown toggler with default state', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.state.chatRooms).toEqual(null);
    expect(toggler.state.acknowledgedAt).toEqual(0);
    expect(toggler.props.title).toEqual('');
  });

  xit('acknowledges a click', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    toggler.acknowledge();

    expect(toggler.state.acknowledgedAt).toBeCloseTo(moment().unix(), 2);
  });

  xit('returns the badge count', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.badgeCount()).toEqual(2);

    var badge = TestUtils.findRenderedDOMComponentWithClass(
      toggler,
      'indicator-danger'
    ).getDOMNode();

    expect(badge).toBeTruthy();
  });

  xit('clears the badge count based on acknowledgedAt', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.badgeCount()).toEqual(2);

    toggler.acknowledge();

    expect(toggler.badgeCount()).toEqual(0);
  });
});
