jest.dontMock(appFile('actions/news_feed_item_action_creators'));

describe('NewsFeedItemActionCreators', function() {
  var NewsFeedItemActionCreators, dispatcherCallback;
  var ActionTypes = require(appFile('constants')).ActionTypes;

  beforeEach(function() {
    $.ajax = jest.genMockFunction();
    Dispatcher = require(appFile('dispatcher'));
    NewsFeedItemActionCreators = require(appFile('actions/news_feed_item_action_creators'));
  });

  describe('archive', function() {
    it('makes an AJAX request to archive a news feed item', function() {
      NewsFeedItemActionCreators.archive('product', 'nfi_id');

      expect($.ajax).toBeCalled();
    });
  });

  describe('subscribe', function() {
    it('makes an AJAX request to subscribe to a news feed item', function() {
      NewsFeedItemActionCreators.subscribe('product', 'nfi_id');

      expect($.ajax).toBeCalled();
    });
  });

  describe('unarchive', function() {
    it('makes an AJAX request to unarchive a news feed item', function() {
      NewsFeedItemActionCreators.unarchive('product', 'nfi_id');

      expect($.ajax).toBeCalled();
    });
  });

  describe('unsubscribe', function() {
    it('makes an AJAX request to unsubscribe from a news feed item', function() {
      NewsFeedItemActionCreators.unsubscribe('product', 'nfi_id');

      expect($.ajax).toBeCalled();
    });
  });
});
