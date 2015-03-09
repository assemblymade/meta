jest.dontMock(pathToFile('dispatcher'));
jest.dontMock('flux');

describe('Dispatcher', function() {
  var Dispatcher;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
  });

  describe('register()', function() {
    it('registers a callback', function() {
      var spy = jest.genMockFn();
      var index = Dispatcher.register(spy);

      expect(spy.mock.calls.length).toEqual(0);
    });
  });

  describe('dispatch()', function() {
    it('halts dispatching if undefined payload', function() {
      var spy = jest.genMockFn();
      global.console.error = spy;
      Dispatcher.dispatch({});

      expect(spy).toBeCalledWith('Cannot dispatch null action. Make sure action type is in constants.js');
    });
  });
});
