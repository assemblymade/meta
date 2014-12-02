jest.dontMock(appFile('actions/bounty_action_creators'));

describe('BountyActionCreators', function() {
  var BountyActionCreators, Dispatcher;

  describe('call()', function() {
    beforeEach(function() {
      $.ajax = jest.genMockFunction();
      analytics.track = jest.genMockFunction();

      Dispatcher = require(appFile('dispatcher'));
      BountyActionCreators = require(appFile('actions/bounty_action_creators'));
      Dispatcher.dispatch.mockClear();
    });

    it('prevents the default action, tracks the event, and makes an AJAX request to the supplied url', function(){
      var e = {
        preventDefault: jest.genMockFunction()
      };

      BountyActionCreators.call(e, 'event.name', '/path/to/resource');

      expect(e.preventDefault.mock.calls.length).toEqual(1);
      expect(analytics.track.mock.calls.length).toEqual(1);
      expect($.ajax.mock.calls[0][0].url).toEqual('/path/to/resource');
    });
  });
});
