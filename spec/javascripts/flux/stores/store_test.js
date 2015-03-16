jest.dontMock(pathToFile('stores/store'));

describe('Store', function() {
  var Store = require(pathToFile('stores/store'));

  it('instantiates a new store that has EventEmitter\'s prototype', function() {
    expect(Store.emitChange).toBeDefined();
    expect(Store.addChangeListener).toBeDefined();
    expect(Store.removeChangeListener).toBeDefined();
    expect(Store.emit).toBeDefined();
  });

  describe('emitChange()', function() {
    it('emits changes', function() {
      Store.emit = jest.genMockFn();
      Store.emitChange();

      expect(Store.emit).toBeCalled();
    });
  });

  describe('addChangeListener()', function() {
    it('adds a change listener', function() {
      Store.on = jest.genMockFn();
      Store.addChangeListener(jest.genMockFn());

      expect(Store.on).toBeCalled();
    });
  });

  describe('removeChangeListener', function() {
    it('removes a listener', function() {
      var stub = jest.genMockFn();

      Store.on = jest.genMockFn();
      Store.removeListener = jest.genMockFn();

      Store.addChangeListener(stub);

      expect(Store.on).toBeCalled();

      Store.removeChangeListener(stub);

      expect(Store.removeListener).toBeCalled();
    });
  });
});
