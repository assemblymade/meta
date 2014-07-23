window.func = {
  dot: function(prop) {
    return function(object) {
      return object[prop]
    }
  },

  add: function(a, b) {
    return a + b
  }
}

