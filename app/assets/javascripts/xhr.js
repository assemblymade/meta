(function() {
  var request = require('superagent/superagent.js');
  var xhr = {
    get: function(path, callback) {
      this.request('get', path, null, callback);
    },

    noCsrfGet: function(path, callback) {
      this.noCsrfRequest('get', path, null, callback);
    },

    patch: function(path, data, callback) {
      this.request('patch', path, data, callback);
    },

    put: function(path, data, callback) {
      this.request('put', path, data, callback);
    },

    post: function(path, data, callback) {
      this.request('post', path, data, callback);
    },

    delete: function(path, data, callback) {
      this.request('del', path, data, callback);
    },

    request: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      var tokenEl = document.getElementsByName('csrf-token')[0];
      var token = tokenEl && tokenEl.content;

      var formValues = [];
      for (var p in data) {
        if (data.hasOwnProperty(p)) {
          formValues.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
        }
      }

      request[method](path)
        .set('X-CSRF-Token', token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(formValues.join('&'))
        .end(function(err, res) {
          if (err) {
            return callback(err);
          }

          return callback(null, res.text);
        });
    },

    noCsrfRequest: function(method, path, data, callback) {
      if (!callback) {
        callback = function() {};
      }

      // bypass the browser's cache:
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
      path = path + ((/\?/).test(path) ? "&" : "?") + (new Date()).getTime();

      request[method](path)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(data)
        .end(function(err, res) {
          if (err) {
            return callback(err);
          }

          return callback(null, res.text);
        });
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = xhr;
  }

  window.xhr = xhr;
})();
