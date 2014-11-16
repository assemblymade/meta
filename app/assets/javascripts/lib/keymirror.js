/** @jsx React.DOM */

(function(){
  var keyMirror = function(obj) {
    var ret = {};
    var key;
    if (!(obj instanceof Object && !Array.isArray(obj))) {
      throw new Error('keyMirror(...): Argument must be an object.');
    }
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      ret[key] = key;
    }
    return ret;
  };

  if (typeof module !== 'undefined') {
    module.keyMirror = keyMirror
  }

  window.keyMirror = keyMirror
})()
