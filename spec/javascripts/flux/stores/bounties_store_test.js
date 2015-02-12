jest.dontMock(appFile('stores/bounties_store'));

describe('BountiesStore', function(){
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var BountiesStore, callback, Dispatcher;

  var bountiesReceive = {
    type: ActionTypes.BOUNTIES_RECEIVE,
    bounties: [{ name: 'Fix' }, { name: 'Everything' }],
    page: 1,
    pages: 2
  };

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    BountiesStore = require(pathToFile('stores/bounties_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getBounties()', function() {
    it('sets loading to true on request', function() {
      callback({
        type: ActionTypes.BOUNTIES_REQUEST
      });

      expect(BountiesStore.getLoading()).toBe(true);
    });

    it('sets the bounties on receive', function() {
      callback(bountiesReceive);

      expect(BountiesStore.getBounties()).toEqual([{ name: 'Fix' }, { name: 'Everything' }]);
    });

    it('sets the current page on receive', function() {
      callback(bountiesReceive);

      expect(BountiesStore.getPage()).toEqual(1);
    });

    it('sets the total pages on receive', function() {
      callback(bountiesReceive);

      expect(BountiesStore.getPages()).toEqual(2);
    });
  });
});
