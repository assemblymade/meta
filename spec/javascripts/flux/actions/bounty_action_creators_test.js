jest.dontMock(appFile('actions/bounty_actions'));

describe('BountyActionCreators', function() {
  var BountyActionCreators, Dispatcher;

  beforeEach(function() {
    $.ajax = jest.genMockFunction();
    analytics.track = jest.genMockFunction();

    Dispatcher = require(appFile('dispatcher'));
    BountyActionCreators = require(appFile('actions/bounty_actions'));
    Dispatcher.dispatch.mockClear();
  });

  describe('call()', function() {
    it('prevents the default action, tracks the event, and makes an AJAX request to the supplied url', function(){
      BountyActionCreators.call('event.name', '/path/to/resource');

      expect(analytics.track.mock.calls.length).toEqual(1);
      expect($.ajax.mock.calls[0][0].url).toEqual('/path/to/resource');
    });
  });

  describe('requestBounties()', function() {
    it('grabs a list of filtered bounties for a product', function() {
      BountyActionCreators.requestBounties('helpful', { tags: ['design'], sort: 'priority', page: 1 })

      request = $.ajax.mock.calls[0][0]

      expect(request.url).toEqual('/helpful/bounties.json')
      expect(request.data).toEqual({ tags: ['design'], sort: 'priority', page: 1 })
    })
  })
});
