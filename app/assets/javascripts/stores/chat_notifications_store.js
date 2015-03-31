'use strict';

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher');
const { List, Map } = require('immutable');
const Store = require('./es6_store');

let chatRooms = List();
let unreadRooms = List();

let matchId = (roomId) => {
  return (id) => {
    return id === roomId;
  };
};

class ChatNotificationsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.CHAT_ROOM_MARKED_AS_READ:
          unreadRooms = unreadRooms.filterNot(matchId(action.id));
          break;
        case ActionTypes.CHAT_ROOMS_RECEIVE:
          chatRooms = List(action.chatRooms);
          unreadRooms = List(action.unreadRooms);
          break;
        default:
          return;
      }

      this.emitChange();
    });
  }

  getChatRooms() {
    return chatRooms;
  }

  getChatRoomsWithUnreadMarked() {
    return chatRooms.map((room) => {
      let r = Map(room);
      if (unreadRooms.map(func.dot('key')).contains(room.id)) {
        return r.set('unread', true);
      }

      return r.set('unread', false);
    });
  }
};

module.exports = new ChatNotificationsStore();

/*

var ChatNotificationsStore = _.extend(_store, ReadTimesMixin, {
  'chat:acknowledge': noop,

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
        var updated = entry.updated > entry.last_read_at;

        if (acknowledgedAt) {
          return updated && entry.updated > acknowledgedAt;
        }

        return updated;
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
      UserStore.getId() +
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
      func.dot('updated')
    );
  }
});

ChatNotificationsStore.dispatchToken = Dispatcher.register(function(payload) {
  var action = payload.action;
  var data = payload.data;
  var sync = payload.sync;

  switch(payload.type) {
    case ActionTypes.CHAT_ADDED:
      _chatRooms['chat_' + data.chat_room].updated_at = data.updated
      ChatNotificationsStore.emitChange()
      break;
  }

  if (!ChatNotificationsStore[action]) {
    return;
  }

  ChatNotificationsStore[action](data);

  if (sync) {
    return _store.emitChange();
  }
});

module.exports = ChatNotificationsStore;
*/
