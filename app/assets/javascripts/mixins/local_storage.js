var LocalStorageMixin = {
  storedAck: function(which) {
    var timestamp = localStorage[which];

    if (timestamp === null || timestamp === "null" || timestamp === undefined) {
      return 0;
    } else {
      return parseInt(timestamp);
    }
  }
};

module.exports = LocalStorageMixin;
