jest.dontMock(pathToFile('stores/interest_store'));

describe('InterestStore', function() {
  var InterestStore;

  beforeEach(function() {
    Dispatcher = require(appFile('dispatcher'))
    InterestStore = require(pathToFile('stores/interest_store'));
    InterestStore.removeAllInterests();
  });

  it('adds an interest', function() {
    InterestStore.addInterest('rugby');

    expect(InterestStore.getInterests()).toEqual(['code', 'design', 'rugby']);
  });

  it('removes an interest', function() {
    InterestStore.addInterest('baseball');

    expect(InterestStore.getInterests()).toEqual(['code', 'design', 'baseball']);

    InterestStore.removeInterest('baseball');

    expect(InterestStore.getInterests()).toEqual(['code', 'design']);
  });
});
