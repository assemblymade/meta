//= require spec_helper
//= require underscore
//= require dispatcher

describe('Dispatcher', function() {
  var spy;

  beforeEach(function(done) {
    spy = sinon.spy();
    done();
  });

  it('registers a callback', function(done) {
    expect(Dispatcher.register(spy)).to.equal(0);
    expect(spy.called).to.be.false;
    done();
  });

  it('dispatches a payload to a callback', function(done) {
    Dispatcher.register(spy);
    Dispatcher.dispatch('foo');
    expect(spy.calledOnce).to.be.true;
    expect(spy.calledWith('foo')).to.be.true;
    done();
  });
});
