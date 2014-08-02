//= require xhr
//= require constants
//= require dispatcher
//= require stores/store
//= require stores/news_feed_users_store

var NewsFeedStore = (function() {
  var READ_RAPTOR_URL = document.getElementsByName('read-raptor-url')[0].content;

  var _stories = {};
  var _optimisticStories = {};
  var _deferred = [];

  var _store = Object.create(Store);

  var _newsFeedStore = _.extend(_store, {
    addStory: function(data) {
      if (!data) {
        return;
      }

      var story = data.story;

      _stories[story.key] = story;
    },

    addStories: function(stories) {
      if (!stories) {
        return;
      }

      for (var i = 0, l = stories.length; i < l; i++) {
        var story = stories[i];

        _stories[story.key] = story;
      }
    },

    applyReadTimes: function(data, stories) {
      for (var i = 0, l = data.length; i < l; i++) {
        var datum = data[i];

        if (datum.last_read_at && stories[datum.key]) {
          stories[datum.key].last_read_at = datum.last_read_at;
        }
      }
    },

    handleFetchedStories: function(method) {
      var self = this;

      return function(err, data) {
        if (err) {
          return console.error(err);
        }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        var users = data.users;
        var stories = data.stories;

        NewsFeedUsersStore.setUsers(users);

        var url = READ_RAPTOR_URL +
          '/readers/' +
          app.currentUser().get('id') +
          '/articles?' +
          _.map(
            stories,
            function(s) {
              return 'key=Story_' + s.id
            }
          ).join('&')

        window.xhr.noCsrfGet(url, self.handleReadRaptor(stories, method));
      }

    },

    handleReadRaptor: function(stories, method) {
      var self = this;

      return function readRaptorCallback(err, data) {
        if (err) {
          return console.error(err);
        }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        stories = _.reduce(
          stories,
          function(hash, story) {
            hash[story.key] = story;
            hash[story.key].last_read_at = 0;

            return hash;
          },
          {}
        );

        self.applyReadTimes(data, stories);
        self[method](stories);
        self.emit(_deferred.pop());
      };
    },

    'newsFeed:acknowledge': function(timestamp) {},

    'newsFeed:fetchStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories('setStories'));
    },

    'newsFeed:fetchMoreStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories('addStories'));
    },

    'newsFeed:markAsRead': function(storyId) {
      var url = '/user/tracking/' + storyId;

      window.xhr.get(url, this.markedAsRead(storyId));
    },

    'newsFeed:markAllAsRead': function() {
      var unread = _.filter(_stories, function(story) {
        return story.last_read_at == null;
      });

      var self = this;

      for (var i = 0, l = unread.length; i < l; i++) {
        (function(j) {
          var story = unread[j];

          if (!story.last_read_at) {
            // we do actually want the id, not they key, here
            var storyId = story.id;
            var url = '/user/tracking/' + storyId;

            window.xhr.get(url, self.markedAsRead(storyId, true, (j + 1 === l)))
          }
        })(i);
      }
    },

    'newsFeed:markStoryAsRead': function(data) {
      var storyId = data.key;
      var url = data.readraptor_url;

      window.xhr.noCsrfGet(url);

      _optimisticStories[storyId] = {
        last_read_at: moment().unix()
      };

      this.emit(_deferred.pop());
    },

    markedAsRead: function(storyId, wait, ready) {
      var self = this;

      return function markedAsRead(err, data) {
        if (err) {
          return console.error(err);
        }

        var story = self.getStory(storyId);

        // FIXME: Use the value from Readraptor
        story.last_read_at = moment().unix();

        if (!wait) {
          return self.emit(_deferred.pop());
        }

        // FIXME: We really need a proper event emitter
        if (ready) {
          self.emit(_deferred.pop());
        } else {
          self.emit(_deferred[_deferred.length - 1]);
        }
      }
    },

    getStory: function(id) {
      var index = _searchStories(id);

      if (index > -1) {
        return _stories[index];
      }

      return null;
    },

    getStories: function() {
      var stories = [];

      for (var i in _stories) {
        stories.push(_stories[i]);
      }

      return stories;
    },

    getUnreadCount: function(timestamp) {
      var count = _.countBy(
        _stories,
        function(entry) {
          if (timestamp) {
            return entry.updated > timestamp
          }
        }
      );

      return count.true || 0;
    },

    setStories: function(stories) {
      for (var story in _optimisticStories) {
        if (stories.hasOwnProperty(story)) {
          stories[story].last_read_at = _optimisticStories[story].last_read_at;
        }
      }

      _optimisticStories = {};

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

  return _newsFeedStore;
})();
