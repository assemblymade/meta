jest.dontMock(pathToFile('stores/store'));

describe('Store', function() {
  var events = require('events')

  // console.log(events)

  var EventEmitter = events.EventEmitter;

  console.log(EventEmitter.prototype.emit)

  var Store = require(pathToFile('stores/store'));

  it('instantiates a new store that has EventEmitter\'s prototype', function() {
    expect(Store.emitChange).toBeDefined();
    expect(Store.addChangeListener).toBeDefined();
    expect(Store.removeChangeListener).toBeDefined();
    expect(Store.emit).toBeDefined();
  });

  describe('emitChange()', function() {
    it('emits changes', function() {
      Store.emitChange();

      expect(EventEmitter.prototype.emit).toBeCalled();
    });
  });

  describe('addChangeListener()', function() {
    it('adds a change listener', function() {
      var mock = jest.genMockFn();

      Store.addChangeListener(mock);

      expect(EventEmitter.prototype.on).toBeCalled();
    });
  });

  describe('removeChangeListener', function() {
    it('removes a listener', function() {
      var mock = jest.genMockFn();

      Store.addChangeListener(mock);

      expect(EventEmitter.prototype.on).toBeCalled();

      Store.removeChangeListener(mock);

      expect(EventEmitter.prototype.removeListener).toBeCalled();
    });
  });
});
