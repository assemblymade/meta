//= require xhr
//= require constants
//= require dispatcher
//= require stores/store

var ChatNotificationsStore = (function() {
  var READ_RAPTOR_URL = document.getElementsByName('read-raptor-url')[0].content;

  var _stories = [];
  var _deferred = [];

  var _store = Object.create(Store);

  var _notificationsStore = _.extend(_store, {
    'chatNotifications:acknowledge': function(timestamp) {},

    addStory: function(data) {
      if (!data) {
        return;
      }

      var story = data.story;

      _stories.push(story);
    },

    fetchStories: function(url) {
      window.xhr.get(url, this.handleFetchedStories.bind(this));
    },

    getUnreadCount: function(acknowledgedAt) {
      var count = _.countBy(_stories,
        function(entry) {
          if (acknowledgedAt) {
            return entry.count > 0 && +new Date(entry.product.updated) > acknowledgedAt;
          }

          return entry.count;
        }
      );

      return count.true || 0;
    },

    handleFetchedStories: function(err, data) {
      if (err) {
        return console.error(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        return console.error(e);
      }

      this.setStories(data);
      this.emit(_deferred.pop());
    },

    getStory: function(id) {
      var index = _searchStories(id);

      if (index > -1) {
        return _stories[index];
      }

      return null;
    },

    getStories: function() {
      return _stories;
    },

    setStories: function(stories) {
      _stories = stories;
    },

    removeStory: function(id) {
      var index = _searchStories(id);

      if (index > -1) {
        _stories.splice(index, 1);
      }
    },

    removeAllStories: function() {
      _stories = [];
    }
  });

  _searchStories = function(id) {
    for (var i = 0, l = _stories.length; i < l; i++) {
      if (_stories[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;
    var sync = payload.sync;

    if (!_store[action]) {
      return;
    }

    _store[action](data);

    if (sync) {
      return _store.emit(event);
    }

    _deferred.push(event);
  });

  return _notificationsStore;
})();
