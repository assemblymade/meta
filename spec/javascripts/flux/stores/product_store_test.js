jest.dontMock(pathToFile('stores/product_store'));

var ActionTypes = require(appFile('constants')).ActionTypes;

describe('ProductStore', function(){
  var callback;
  var ProductStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
    ProductStore = require(pathToFile('stores/product_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getSlug()', function() {
    it("returns the current product's slug", function(){
      callback({
        type: ActionTypes.PRODUCT_RECEIVE,
        product: { slug: 'meta' }
      });

      expect(ProductStore.getSlug()).toEqual('meta');
    });
  });

  describe('getProduct()', function() {
    it("returns the current product's slug", function(){
      callback({
        type: ActionTypes.PRODUCT_RECEIVE,
        product: { slug: 'meta', id: '123abc' }
      });

      expect(ProductStore.getProduct().id).toEqual('123abc');
    });
  });
});
