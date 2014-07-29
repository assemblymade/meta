//= require xhr
//= require constants
//= require dispatcher
//= require stores/store
//= require stores/full_page_news_feed_users_store

var FullPageNewsFeedStore = (function() {
  var READ_RAPTOR_URL = document.getElementsByName('read-raptor-url')[0].content;

  var _stories = [];
  var _deferred = [];

  var _store = Object.create(Store);

  var _newsFeedStore = _.extend(_store, {
    addStory: function(data) {
      if (!data) {
        return;
      }

      var story = data.story;

      _stories.push(story);
    },

    addStories: function(stories) {
      if (!stories) {
        return;
      }

      _stories = _stories.concat(stories);
    },

    'fullPageNewsFeed:fetchStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories.bind(this));
    },

    'fullPageNewsFeed:fetchMoreStories': function(url) {
      window.xhr.get(url, this.handleMoreStories.bind(this));
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

      var users = data.users;
      var stories = data.stories;

      FullPageNewsFeedUsersStore.setUsers(users);

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

      window.xhr.noCsrfGet(url, this.handleReadRaptor(stories));
    },

    handleReadRaptor: function(stories) {
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

        self.applyReadTimes(data, stories);

        self.setStories(stories);

        self.emit(_deferred.pop());
      };
    },

    handleMoreStories: function(err, data) {
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

      FullPageNewsFeedUsersStore.addUsers(users);

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

      window.xhr.noCsrfGet(url, this.handleMoreReadRaptor(stories));
    },

    handleMoreReadRaptor: function(stories) {
      var self = this;

      return function moreReadRaptorCallback(err, data) {
        if (err) {
          return console.error(err);
        }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        self.applyReadTimes(data, stories);

        self.addStories(stories);

        self.emit(_deferred.pop());
      };
    },

    applyReadTimes: function(data, stories) {
      for (var i = 0, l = data.length; i < l; i++) {
        var datum = data[i];

        if (datum.read_at) {
          for (var j = 0, k = stories.length; j < k; j++) {
            var story = stories[j];

            if (datum.key.indexOf(story.id) > -1) {
              story.read_at = datum.read_at;
            }
          }
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

  return _newsFeedStore;
})();
