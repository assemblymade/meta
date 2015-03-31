;(function() {
  var LandlineMigration = function(url, team, uid) {
    this.url = url;
    this.team = team;
    this.uid = uid;
    this.socket = io(this.url);

    var token = retrieveToken();

    if (token) {
      return this.initializeSocket.call(this);
    }

    this.logIn(this.initializeSocket.bind(this));
  };

  LandlineMigration.prototype.authorizeSocket = function() {
    this.socket.emit('auth', retrieveToken(), this.handleAuthorizationResponse.bind(this));
  };

  LandlineMigration.prototype.handleAuthorizationResponse = function(response) {
    if (response.success) {
      this.socket.on('room.unread', this.handleUnread.bind(this));
      $.ajax({
        url: this.url + '/rooms',
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + retrieveToken(),
          'Content-Type': 'application/json',
        },
        dataType: 'json',
        success: function(result) {
          var memberships = result.memberships;
          var rooms = result.rooms;
          var unreadRooms = result.unread_rooms;

          Dispatcher.dispatch({
            type: CONSTANTS.ActionTypes.CHAT_ROOMS_RECEIVE,
            chatRooms: _.filter(rooms, function(room) {
              return memberships.indexOf(room.id) > -1;
            }),
            unreadRooms: unreadRooms
          });
        },
        error: function(jqXhr, textStatus) {
          console.log(textStatus);
        }
      });
    } else {
      this.handleFailure.call(this, response);
    }
  };

  LandlineMigration.prototype.handleFailure = function() {
    console.error(response.message);
  };

  LandlineMigration.prototype.handleUnread = function(room) {
    console.log(room);
  };

  LandlineMigration.prototype.initializeSocket = function() {
    this.socket.on('connect', this.authorizeSocket.bind(this));
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

  LandlineMigration.prototype.pushComment = function(comment) {
    var room = comment.target.label || 'general';
    var message = {
      body: comment.body
    };
    var token = retrieveToken();
    var url = this.url;
    var postMessage = function() {
      $.ajax({
        url: url + '/rooms/' + room + '/messages?bridge=true',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        dataType: 'json',
        data: JSON.stringify(message),
        success: function(result) {},
        error: function(err) {}
      });
    };

    if (token) {
      postMessage();
    } else {
      this.logIn(postMessage);
    }
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
