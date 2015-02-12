jest.dontMock(appFile('stores/assets_store'));

describe('AssetsStore', function(){
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var AssetsStore, callback, Dispatcher;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    AssetsStore = require(pathToFile('stores/assets_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getAssets()', function() {
    it("gets the assets it's passed", function() {
      callback({
        type: ActionTypes.ASSETS_RECEIVE,
        assets: [{ name: 'Asset' }, { name: 'Buttet' }]
      });

      expect(AssetsStore.getAssets()).toEqual([{ name: 'Asset' }, { name: 'Buttet' }]);
    });
  });
});
