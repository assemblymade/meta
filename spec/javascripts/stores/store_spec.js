//= require spec_helper
//= require underscore
//= require dispatcher
//= require stores/store

describe('Store', function() {
  it('provides a Store prototype', function(done) {
    expect(Store).to.exist;
    expect(Store.emit).to.exist;
    expect(Store.addChangeListener).to.exist;
    expect(Store.removeChangeListener).to.exist;
    done();
  });

  it('is extensible in a safe way', function(done) {
    var someStore = Object.create(Store);
    var anotherStore = Object.create(Store);

    expect(someStore).to.exist;
    expect(anotherStore).to.exist;

    someStore.add = function() {};
    anotherStore.add = function() {};

    expect(someStore.add).not.to.eql(anotherStore.add);

    done();
  });
});
