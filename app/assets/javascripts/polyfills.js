if (typeof Object.create !== 'function') {
  // Credit: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  (function() {
    var F = function() {};

    Object.create = function(o) {
      if (arguments.length > 1) {
        return console.error("Unsupported second argument. Try upgrading to a more modern browswer.");
      }

      if (o === null) {
        return console.error("Prototype can't be null. Try upgrading to a more modern browser.");
      }

      if (typeof of !== 'object') {
        return console.error("Argument must be an object");
      }

      F.prototype = o;

      return new F();
    }
  })();
}
