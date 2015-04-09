;(function() {
  var LandlineMigration = function(url, team, uid) {
    this.url = url;
    this.team = team;
    this.uid = uid;

    var token = retrieveToken();

    if (token) {
      return this;
    }

    this.logIn();
  };

  LandlineMigration.prototype.logIn = function(callback) {
    callback = callback || function() {};

    $.ajax({
      url: this.url + '/sessions/new?team=' + this.team + '&uid=' + this.uid,
      method: 'GET',
      success: function(result) {
        var expiration = result.expiration;
        var token = result.token;

        localStorage.setItem('ll_token', token);
        localStorage.setItem('ll_expiration', expiration);
        callback();
      },
      error: function(err) {
        console.log(arguments);
      }
    });
  };

  window.LandlineMigration = LandlineMigration;

  function retrieveToken() {
    var token = localStorage.getItem('ll_token');
    var expiration = localStorage.getItem('ll_expiration');

    if ((Date.now() / 1000) < expiration) {
      return token;
    }
  }
})();
