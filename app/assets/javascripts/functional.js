window.func = {
  dot: function(prop) {
    return function(object) {
      return object && object[prop]
    }
  },

  add: function(a, b) {
    return a + b
  }
}
