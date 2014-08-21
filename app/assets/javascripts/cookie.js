(function() {
  var Cookie = {
    createCookie: function(name, value, expiration) {
      var date = new Date();

      date.setTime(date.getTime() + ((expiration || 365) * 24 * 60 * 60 * 1000)); // 1 year

      document.cookie = name + "=" + value + '; expires=' + date.toGMTString() + "; path=/";
    },

    getCookie: function(name) {
      var cookieName = name + "=";
      var cookies = document.cookie.split(';');

      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];

        while(cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1, cookie.length);
        }

        if (cookie.indexOf(cookieName) === 0) {
          return cookie.substring(cookieName.length, cookie.length);
        }
      }

      return null;
    },

    removeCookie: function(name) {
      this.createCookie(name, "", -1);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = Cookie;
  }

  window.Cookie = Cookie;
})();
