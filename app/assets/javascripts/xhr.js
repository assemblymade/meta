(function() {
  var xhr = {
    get: function(path, callback) {
      this.request('GET', path, null, callback);
    },

    noCsrfGet: function(path, callback) {
      this.noCsrfRequest('GET', path, null, callback);
    },

    patch: function(path, data, callback) {
      this.request('PATCH', path, data, callback);
    },

    put: function(path, data, callback) {
      this.request('PUT', path, data, callback);
    },

    post: function(path, data, callback) {
      this.request('POST', path, data, callback);
    },

    request: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      var tokenEl = document.getElementsByName('csrf-token')[0];
      var token = tokenEl && tokenEl.content;
      var request = new XMLHttpRequest();

      request.open(method, path, true);
      request.setRequestHeader('X-CSRF-Token', token);
      request.setRequestHeader('Accept', 'application/json');
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      var formValues = [];
      for(var p in data){
        if (data.hasOwnProperty(p)) {
          formValues.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
        }
      }
      request.send(formValues.join("&"));

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

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return callback(null, request.responseText);
        }

        callback(new Error(request.responseText));
      };

      // bypass the browser's cache:
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
      request.open(method, path + ((/\?/).test(path) ? "&" : "?") + (new Date()).getTime(), true);
      request.send(data);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = xhr;
  }

  window.xhr = xhr;
})();
