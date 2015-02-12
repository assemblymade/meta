jest.dontMock(appFile('stores/bounty_marks_store'));

describe('BountyMarksStore', () => {
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var BountyMarksStore, callback, Dispatcher;

  beforeEach(() => {
    Dispatcher = require(pathToFile('dispatcher'));
    BountyMarksStore = require(pathToFile('stores/bounty_marks_store'));
    callback = Dispatcher.register.mock.calls[0][0];
  });

  describe('getMarks()', () => {
    it('gets all of the marks', () => {
      callback({
        type: ActionTypes.BOUNTY_MARKS_RECEIVE,
        marks: ['foo', 'bar']
      });

      expect(BountyMarksStore.getMarks().toJS()).toEqual(['foo', 'bar']);
    });
  });
});
