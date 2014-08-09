//= require spec_helper
//= require underscore
//= require react
//= require components

describe('InterestStore', function() {
  after(function() {
    Dispatcher.removeAll();
  });

  beforeEach(function() {
    InterestStore.removeAllInterests();

  });

  it('adds an interest', function() {
    InterestStore.addInterest('rugby');

    expect(InterestStore.getInterests()).to.eql(['code', 'design', 'rugby']);
  });

  it('removes an interest', function() {
    InterestStore.addInterest('baseball');

    expect(InterestStore.getInterests()).to.eql(['code', 'design', 'baseball']);

    InterestStore.removeInterest('baseball');

    expect(InterestStore.getInterests()).to.eql(['code', 'design']);
  });
});
