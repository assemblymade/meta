//= require spec_helper
//= require jquery
//= require underscore
//= require backbone
//= require views/sign_up_view

/**
 * Really, the require tree should end here,
 * but we need to pull in application.js
 * because the Backbone Application is
 * instantiated there. Maybe we could stub
 * that out, but I'm wary of stubbing out
 * too much to start with and consequently
 * having our tests not actually test much.
 */

//= require application

fixture.preload('sign_up_form.html');

// FB needs to be globally available;
// this probably means that this view
// should be refactored/decoupled.

window.FB = {
  login: function(callback, options) {
    callback({ status: 'connected' })
  }
};

describe('Sign Up View', function() {
  it('instantiates a view', function(done) {
    var signUpView = new SignUpView();
    expect(signUpView).not.to.be.undefined;
    done();
  });

  describe('sign up flow', function() {
    var s;
    var noop = function() {};

    beforeEach(function(done) {
      this.fixture = fixture.load('sign_up_form.html', true)
      s = new SignUpView();
      done()
    });

    it('signs in with Facebook', function(done) {
      var stub = sinon.stub(s, 'facebookConnected');
      s.render();
      s.facebookSignIn({ preventDefault: noop });
      expect(stub.calledOnce).to.be.true;
      s.facebookConnected.restore();
      done();
    });
  });
});
