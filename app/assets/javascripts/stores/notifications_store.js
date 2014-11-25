var xhr = require('../xhr');
// var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');
var NotificationsUsersStore = require('../stores/notifications_users_store');
var ReadTimesMixin = require('../mixins/read_times');

(function() {
  var _stories = {};
  var _optimisticStories = {};
  var _store = Object.create(Store);

  var _notificationsStore = _.extend(_store, ReadTimesMixin, {
    addStory: function(data) {
      if (!data) {
        return;
      }

      var story = data.story;

      _stories[story.key] = story;
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

      var users = _.reduce(data.users, function(memo, user){ memo[user.id] = user; return memo}, {})
      var stories = data.stories;

      if (!_.isEmpty(users)) {
        NotificationsUsersStore.setUsers(users);
      }

      var url = this.rrUrl() +
        '/readers/' +
        app.currentUser().get('id') +
        '/articles?' +
        _.map(
          stories,
          function(s) {
            return 'key=' + s.key
          }
        ).join('&')

      xhr.noCsrfGet(url, this.handleReadRaptor(stories, 'key'));
    },

    'notifications:acknowledge': this.noop,

    'notifications:fetchStories': function(url) {
      xhr.get(url, this.handleFetchedStories.bind(this));
    },

    'notifications:fetchMoreStories': function(url) {
      this['notifications:fetchStories'](url);
    },

    'notifications:markAsRead': function(storykey) {
      var url = '/user/tracking/' + storykey;

      xhr.get(url, this.markedAsRead(storykey));
    },

    'notifications:markAllAsRead': function() {
      for (var i in _stories) {
        if (_stories.hasOwnProperty(i)) {
          this['notifications:markAsRead'](_stories[i].key);
        }
      }
    },

    markedAsRead: function(storyKey) {
      var self = this;

      return function markedAsRead(err, data) {
        if (err) {
          return console.error(err);
        }

        var story = self.getStory(storyKey);

        // Add an optimistic timestamp, since we don't get one from Readraptor
        story.last_read_at = moment().unix();

        self.setStory(story);
        self.emitChange();
      }
    },

    getStory: function(key) {
      return _stories[key];
    },

    getStories: function() {
      var stories = [];

      for (var i in _stories) {
        stories.push(_stories[i]);
      }

      stories.sort(function(a, b) {
        return (b.updated - a.updated);
      });

      return stories;
    },

    getUnreadCount: function(timestamp) {
      var count = _.countBy(
        _stories,
        function(entry) {
          if (timestamp) {
            // console.info(
            //   entry.key,
            //   'updated', moment.unix(entry.updated).format('h:mm:ss a'),
            //   'last_read_at', moment.unix(entry.last_read_at).format('h:mm:ss a'),
            //   'timestamp', moment.unix(timestamp).format('h:mm:ss a'),
            //   'updated > last_read_at', entry.updated > entry.last_read_at,
            //   'updated > timestamp', entry.updated > timestamp)

            return entry.updated > entry.last_read_at && entry.updated > timestamp;
          }
        }
      );

      return count.true || 0;
    },

    setStory: function(story) {
      _stories[story.key] = story;
    },

    setStories: function(stories) {
      for (var story in _optimisticStories) {
        if (stories.hasOwnProperty(story)) {
          stories[story].last_read_at = _optimisticStories[story].last_read_at;
        }
      }

      _optimisticStories = {};

      for (var s in stories) {
        _stories[s] = stories[s];
      }
    },

    removeStory: function(key) {
      delete _stories[key];
    },

    removeAllStories: function() {
      _stories = [];
    }
  });

  _notificationsStore.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var sync = payload.sync;

    if (!_notificationsStore[action]) {
      return;
    }

    _notificationsStore[action](data);

    if (sync) {
      return _store.emitChange();
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = _notificationsStore;
  }

  window.NotificationsStore = _notificationsStore;
})();
