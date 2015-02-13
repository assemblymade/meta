jest.dontMock(pathToFile('stores/bounty_store'));

var ActionTypes = require(appFile('constants')).ActionTypes;

describe('BountyStore', function() {
  var callback;
  var BountyStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    BountyStore = require(pathToFile('stores/bounty_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getState()', function() {
    it("gets the bounty's state", function() {
      expect(BountyStore.getState()).toBeUndefined();

      callback({
        type: ActionTypes.BOUNTY_WORK_SUBMITTED,
      });

      expect(BountyStore.getState()).toEqual('reviewing');
    });
  });
});
