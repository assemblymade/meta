jest.dontMock(pathToFile('components/chat_notifications_toggler.js.jsx'));
jest.dontMock(pathToFile('mixins/dropdown_toggler.js.jsx'));
jest.dontMock(pathToFile('mixins/local_storage.js'));

describe('ChatNotificationsToggler', function() {
  var chatRooms;
  var ChatNotificationsStore;

  beforeEach(function() {
    global.localStorage = {};
    global.moment = require.requireActual('moment');

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
    var Toggler = require(pathToFile('components/chat_notifications_toggler.js.jsx'));

    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.state.chatRooms).toEqual(null);
    expect(toggler.state.acknowledgedAt).toEqual(0);
    expect(toggler.props.title).toEqual('');
  });

  it('acknowledges a click', function() {
    jest.dontMock('moment');

    var Toggler = require(pathToFile('components/chat_notifications_toggler.js.jsx'));
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    toggler.acknowledge();

    expect(toggler.state.acknowledgedAt).toBeCloseTo(moment().unix(), 2);
  });

  it('adds the bg-red class if it has notifications', function() {
    jest.dontMock(appFile('mixins/dropdown_toggler.js.jsx'));
    jest.dontMock(appFile('components/ui/jewel.js.jsx'));

    var Toggler = require(pathToFile('components/chat_notifications_toggler.js.jsx'));
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.badgeCount()).toEqual(2);

    var badge = TestUtils.scryRenderedDOMComponentsWithClass(
      toggler,
      'bg-red'
    );

    expect(badge.length).toEqual(1);
  });

  it('clears the badge count based on acknowledgedAt', function() {
    var Toggler = require(pathToFile('components/chat_notifications_toggler.js.jsx'));
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.badgeCount()).toEqual(2);

    toggler.acknowledge();

    expect(toggler.badgeCount()).toEqual(0);
  });
});
