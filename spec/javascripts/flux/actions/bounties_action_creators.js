jest.dontMock(appFile('actions/bounties_action_creators'))

describe('BountiesActionCreators', function() {
  var BountiesActionCreators, Dispatcher

  describe('requestBounties()', function() {
    beforeEach(function() {
      $.ajax = jest.genMockFunction();

      Dispatcher = require(appFile('dispatcher'));
      BountiesActionCreators = require(appFile('actions/bounties_action_creators'));
      Dispatcher.dispatch.mockClear();
    })

    it('grabs a list of filtered bounties for a product', function() {
      BountiesActionCreators.requestBounties('helpful', { tags: ['design'], sort: 'priority', page: 1 })

      request = $.ajax.mock.calls[0][0]

      expect(request.url).toEqual('/helpful/bounties.json')
      expect(request.data).toEqual({ tags: ['design'], sort: 'priority', page: 1 })
    })
  })
})
