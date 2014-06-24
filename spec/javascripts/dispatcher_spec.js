//= require spec_helper
//= require underscore
//= require dispatcher

describe('Dispatcher', function() {
  afterEach(function(done) {
    Dispatcher.remove(0);

    done();
  });

  it('registers a callback', function(done) {
    var spy = sinon.spy();
    var index = Dispatcher.register(spy);

    expect(index).to.equal(0);
    expect(spy.called).to.be.false;

    done();
  });

  it('dispatches a payload to a callback', function(done) {
    var spy = sinon.spy();

    Dispatcher.register(spy);
    Dispatcher.dispatch('foo');

    expect(spy.calledOnce).to.be.true;
    expect(spy.calledWith('foo')).to.be.true;

    done();
  });

  it('removes a callback', function(done) {
    var spy = sinon.spy();
    var index = Dispatcher.register(spy);

    expect(index).to.equal(0);

    var removed = Dispatcher.remove(index);
    expect(removed).to.be.true;
    
    done();
  });
});
