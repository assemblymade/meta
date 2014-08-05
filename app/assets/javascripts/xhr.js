(function() {
  var xhr = {
    get: function(path, callback) {
      this.request('GET', path, null, callback);
    },

    noCsrfGet: function(path, callback) {
      this.noCsrfRequest('GET', path, null, callback);
    },

    post: function(path, data, callback) {
      this.request('POST', path, data, callback);
    },

    request: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = new XMLHttpRequest();

      request.open(method, path, true);
      request.setRequestHeader('X-CSRF-Token', document.getElementsByName('csrf-token')[0].content);
      request.setRequestHeader('Accept', 'application/json');
      request.send(data);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return callback(null, request.responseText);
        }

        callback(new Error(request.responseText));
      }
    },

    noCsrfRequest: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = new XMLHttpRequest();

      request.open(method, path, true);
      request.setRequestHeader('Accept', 'application/json');
      request.send(data);

      request.onload = function() {
        // console.log(request.responseText);
        if (request.status >= 200 && request.status < 400) {
          return callback(null, request.responseText);
        }

        callback(new Error(request.responseText));
      }
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = xhr;
  }

  window.xhr = xhr;
})();
