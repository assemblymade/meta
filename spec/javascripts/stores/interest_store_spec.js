//= require spec_helper
//= require underscore
//= require react
//= require components

describe('InterestStore', function() {
  after(function(done) {
    Dispatcher.removeAll();

    done();
  });

  beforeEach(function(done) {
    InterestStore.removeAllInterests();

    done();
  });

  it('adds an interest', function(done) {
    InterestStore.addInterest('rugby');

    expect(InterestStore.getInterests()).to.eql(['code', 'design', 'rugby']);
    done();
  });

  it('removes an interest', function(done) {
    InterestStore.addInterest('baseball');

    expect(InterestStore.getInterests()).to.eql(['code', 'design', 'baseball']);

    InterestStore.removeInterest('baseball');

    expect(InterestStore.getInterests()).to.eql(['code', 'design']);
    done();
  });
});
