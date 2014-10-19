/** @jsx React.DOM */

jest.dontMock(pathToFile('components/dropdown_notifications_toggler.js.jsx'));
jest.dontMock(pathToFile('mixins/dropdown_toggler.js.jsx'));
jest.dontMock(pathToFile('mixins/local_storage'));

describe('DropdownNotificationsToggler', function() {
  global.moment = require.requireActual('moment');
  global.document.title = 'testing123';

  var Dispatcher = require(pathToFile('dispatcher'));
  var NotificationsStore = require(pathToFile('stores/notifications_store'));
  var CONSTANTS = require.requireActual(pathToFile('constants'));
  var Toggler = require(pathToFile('components/dropdown_notifications_toggler.js.jsx'));

  var NF = CONSTANTS.NOTIFICATIONS;
  var toggler;

  beforeEach(function() {
    global.localStorage = {};

    toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bell" href="/news-feed" label="unicorns" />
    );
  });

  describe('acknowledge()', function() {
    it('stores and dispatches an acknowledgment', function() {
      toggler.acknowledge();

      expect(localStorage.notificationsAck).toBeCloseTo(moment().unix(), 2);
      expect(Dispatcher.dispatch).toBeCalledWith({
        action: NF.ACTIONS.ACKNOWLEDGE,
        data: localStorage.notificationsAck,
        sync: true
      });
    });
  });

  describe('badge()', function() {
    beforeEach(function() {
      NotificationsStore.getUnreadCount.mockReturnValueOnce(2);

      // don't use the above-defined toggler
      badgedToggler = TestUtils.renderIntoDocument(
        <Toggler iconClass="icon icon-bell" href="/news-feed" label="unicorns" />
      );
    });

    it('badges the icon', function() {
      badgedToggler.badge(2);

      var badge = TestUtils.findRenderedDOMComponentWithClass(
        badgedToggler,
        'badge-notification'
      ).getDOMNode();

      expect(badge).toBeDefined();
      expect(badge.innerHTML).toEqual('2');
    });
  });

  describe('badgeCount()', function() {
    it('gets the unread count after toggler.state.acknowledgedAt from the NotificationsStore', function() {
      toggler.badgeCount();

      expect(NotificationsStore.getUnreadCount).toBeCalledWith(0);
    });
  });

  describe('componentWillMount()', function() {
    it('registers a change listener on the NotificationsStore', function() {
      toggler.componentWillMount();

      expect(NotificationsStore.addChangeListener).toBeCalledWith(toggler.getStories);
    });
  });

  describe('getDefaultProps()', function() {
    it('sets the title based on the document\'s title', function() {
      expect(toggler.props.title).toEqual('testing123');
    });
  });

  describe('getInitialState()', function() {
    it('sets the stories and acknowledgedAt', function() {
      expect(toggler.state.stories).toBeNull();
      expect(toggler.state.acknowledgedAt).toEqual(0);
    });
  });

  describe('getStories()', function() {
    it('gets the stories from the NotificationsStore', function() {
      toggler.getStories();

      expect(NotificationsStore.getStories).toBeCalled();
    });
  });

  describe('latestStory()', function() {
    beforeEach(function() {
      toggler.setState({
        stories: [
          {
            updated: 123
          },
          {
            updated: 456
          },
          {
            updated: 789
          }
        ]
      });
    });

    it('gets the most recently updated story', function() {
      expect(toggler.latestStory()).toEqual({ updated: 789 });
    });
  });

  describe('latestStoryTimestamp()', function() {
    beforeEach(function() {
      toggler.setState({
        stories: [
          {
            updated: 123
          },
          {
            updated: 456
          },
          {
            updated: 789
          }
        ]
      });
    });

    it('gets the timestamp of the latest story', function() {
      expect(toggler.latestStoryTimestamp()).toEqual(789);
    });
  });
});
