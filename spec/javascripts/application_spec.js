//= require spec_helper

/**
 * Requiring the whole application makes tests take
 * about five seconds to load. We might want to look
 * into how we're loading JavaScript in production
 * as one spot where speed gains could be had.
 */

//= require application

describe('Application', function() {
  it('instantiates an Application', function(done) {
    var app = new Application();
    expect(app).to.exist;
    done();
  });
});
