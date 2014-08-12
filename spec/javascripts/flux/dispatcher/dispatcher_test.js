jest.dontMock(pathToFile('dispatcher'));

describe('Dispatcher', function() {
  var Dispatcher = require(pathToFile('dispatcher'));

  beforeEach(function() {
    Dispatcher.removeAll();
  });

  describe('register()', function() {
    it('registers a callback', function() {
      var spy = jest.genMockFn();
      var index = Dispatcher.register(spy);

      expect(index).toEqual('asm_0');
      expect(spy.mock.calls.length).toEqual(0);
    });
  });

  describe('dispatch()', function() {
    it('dispatches a payload to a callback', function() {
      var spy = jest.genMockFn();

      Dispatcher.register(spy);
      Dispatcher.dispatch('foo');

      expect(spy).toBeCalledWith('foo');
    });

    it('returns if there are no callbacks', function() {
      var spy = jest.genMockFn();

      Dispatcher.dispatch('foo');

      expect(spy.mock.calls.length).toEqual(0);
    });

    it('returns if already dispatching', function() {
      var spy = jest.genMockFn().mockImpl(function() {
        Dispatcher.dispatch('bar');
      });

      global.console.warn = jest.genMockFn();

      Dispatcher.register(spy);
      Dispatcher.dispatch('foo');

      expect(spy.mock.calls.length).toEqual(1);
      expect(spy).toBeCalledWith('foo');
      expect(console.warn).toBeCalled();
    });

    xit('continues if callback is pending');
  });

  describe('remove()', function() {
    it ('removes a callback', function() {
      var spy = jest.genMockFn();
      var id = Dispatcher.register(spy);

      Dispatcher.dispatch('foo');

      expect(spy).toBeCalledWith('foo');

      Dispatcher.remove(id);
      Dispatcher.dispatch('bar');

      expect(spy.mock.calls.length).toEqual(1);
      expect(spy.mock.calls[0][0]).toBe('foo');
    });
  });

  xdescribe('waitFor()', function() {
    it('waits for another callback', function() {
      var spy = jest.genMockFn();
      var id = Dispatcher.register(spy);

      var waiter = jest.genMockImpl(function(payload) {
        Dispatcher.waitFor([id]);
      });

      Dispatcher.dispatch('foo');

      expect(Dispatcher.waitFor).toBeCalled();
      expect(spy).toBeCalled();
      expect(waiter).toBeCalled();
    });
  });
});
