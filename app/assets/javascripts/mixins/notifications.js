module.exports = {
  applyReadTimes: function(data, stories) {
    for (var i = 0, l = data.length; i < l; i++) {
      var datum = data[i];

      if (datum.last_read_at && stories[datum.key]) {
        stories[datum.key].last_read_at = datum.last_read_at;
      }
    }
  },

  handleReadRaptor: function(stories, key) {
    return function readRaptorCallback(err, data) {
      if (err) {
        return console.error(err);
      }

      stories = _.reduce(
        stories,
        function(hash, story) {
          hash[story[key]] = story;
          hash[story[key]].last_read_at = 0;

          return hash;
        },
        {}
      );

      this.applyReadTimes(data, stories);
      this.setStories(stories);
      this.emitChange();
    }.bind(this);
  },

  noop: function() {},

  rrMetaTag: document.getElementsByName('read-raptor-url'),

  rrUrl: function() {
    return this.rrMetaTag && this.rrMetaTag[0] && this.rrMetaTag[0].content;
  }
};
