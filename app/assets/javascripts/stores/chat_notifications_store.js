var ActionTypes = window.CONSTANTS.ActionTypes
var xhr = require('../xhr');
// var Dispatcher = require('../dispatcher');
var Store = require('./store');
var ReadTimesMixin = require('../mixins/read_times');
var moment = require('moment');

(function() {
  var _chatRooms = {};
  var _sortKeys = [];
  var _optimisticChatRooms = {};
  var _store = Object.create(Store);

  var _notificationsStore = _.extend(_store, ReadTimesMixin, {
    'chat:acknowledge': this.noop,

    'chat:markRoomAsRead': function(payload) {
      xhr.noCsrfGet(payload.readraptor_url);

      _optimisticChatRooms[payload.id] = {
        last_read_at: moment().unix()
      };
    },

    'chat:fetchChatRooms': function(url) {
      xhr.get(url, this.handleFetchedChatRooms.bind(this));
    },

    getUnreadCount: function(acknowledgedAt) {
      var count = _.countBy(
        _chatRooms,
        function(entry) {
          var updated_at = entry.updated_at > entry.last_read_at;

          if (acknowledgedAt) {
            return updated_at && entry.updated_at > acknowledgedAt;
          }

          return updated_at;
        }
      );

      return count.true || 0;
    },

    handleFetchedChatRooms: function(err, data) {
      if (err) {
        return console.error(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        return console.error(e);
      }

      if (window.app.chatRoom) {
        if (!_.find(data.chat_rooms, function(room){ return room.id == window.app.chatRoom.id })) {
          data.chat_rooms.push(window.app.chatRoom)
        }
      }

      var chatRooms = data.chat_rooms;
      _sortKeys = data.sort_keys;

      var url = this.rrUrl() +
        '/readers/' +
        app.currentUser().get('id') +
        '/articles?' +
        _.map(
          chatRooms,
          function(r) {
            return 'key=' + r.id
          }
        ).join('&');

      xhr.noCsrfGet(url, this.handleReadRaptor(chatRooms, 'id'));
    },

    getChatRoom: function(id) {
      if (_optimisticChatRooms[id]) {
        _chatRooms[id].last_read_at = _optimisticChatRooms[id].last_read_at;
      }

      return _chatRooms[id];
    },

    getChatRooms: function() {
      for (var id in _optimisticChatRooms) {
        if (_chatRooms[id]) {
          _chatRooms[id].last_read_at = _optimisticChatRooms[id].last_read_at;
        }
      }

      return _chatRooms;
    },

    getSortKeys: function() {
      return _sortKeys;
    },

    setStories: function(chatRooms) {
      _chatRooms = chatRooms;

      var keys = _.keys(_optimisticChatRooms)
      for (var i = 0; i < keys.length; i++) {
        if (_chatRooms[keys[i]]) {
          _chatRooms[keys[i]].last_read_at = _optimisticChatRooms[keys[i]].last_read_at;
        }
      }

      _optimisticChatRooms = {}
    },

    removeChatRoom: function(id) {
      delete _chatRooms[id]
    },

    removeAllChatRooms: function() {
      _chatRooms = {};
    },

    mostRecentlyUpdatedChatRoom: function() {
      if (_.keys(_chatRooms).length === 0) {
        return null;
      }

      return _.max(
        _.filter(
          _.values(_chatRooms),
          function filterRooms(room) {
            return room.id !== (app.chatRoom || {}).id;
          }
        ),
        func.dot('updated_at')
      );
    }
  });

  _notificationsStore.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var sync = payload.sync;

    switch(payload.type) {
      case ActionTypes.PUSHER_USER_ACTION:
        if (payload.event == 'chat-added') {
          _chatRooms['chat_' + payload.payload.chat_room].updated_at = payload.payload.updated_at
        }
        _notificationsStore.emitChange()
        break;
    }

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

  window.ChatNotificationsStore = _notificationsStore;
})();
