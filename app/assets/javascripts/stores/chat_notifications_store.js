'use strict';

var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher');
var moment = require('moment');
var Store = require('./es6_store');
var UserStore = require('./user_store');

var chatRooms = {};
var optimisticChatRooms = {};
var noop = function() {};

let sortKeys = [];

class ChatNotificationsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.CHAT_NOTIFICATIONS_CHAT_ROOM_MARKED_AS_READ:
          optimisticChatRooms[action.id] = {
            last_read_at: moment().unix()
          };
          break;
        case ActionTypes.CHAT_NOTIFICATIONS_CHAT_ROOMS_RECEIVE:
          chatRooms = action.chatRooms;
          optimisticChatRooms = {};
          break;
        case ActionTypes.CHAT_NOTIFICATIONS_SORT_KEYS_RECEIVE:
          sortKeys = action.sortKeys;
          // no need to emit a change event just for sortKeys
          return;
        default:
          return;
      }

      this.emitChange();
    });
  }

  getChatRoom(id) {
    if (optimisticChatRooms[id]) {
      chatRooms[id].last_read_at = optimisticChatRooms[id].last_read_at;
    }

    return chatRooms[id];
  }

  getChatRooms() {
    let bareRooms = _.values(chatRooms);

    bareRooms.forEach((room) => {
      if (optimisticChatRooms[room.id]) {
        room.last_read_at = optimisticChatRooms[room.id].last_read_at;
      }

      chatRooms[room.id] = room;
    });

    return chatRooms;
  }

  getSortKeys() {
    return sortKeys;
  }

  getUnreadCount(acknowledgedAt) {
    return _.countBy(chatRooms, (room) => {
      let updated = entry.updated > entry.last_read_at;

      if (acknowledgedAt) {
        return updated && entry.updated > acknowledgedAt;
      }

      return updated;
    }).true || 0;
  }

  mostRecentlyUpdatedChatRoom() {
    if (_.keys(chatRooms).length === 0) {
      return null;
    }

    return _.max(
      _.filter(
        _.values(chatRooms),
        (room) => {
          return room.id !== (window.app.chatRoom || {}).id;
        }
      ),
      func.dot('updated')
    );
  }
};

module.exports = new ChatNotificationsStore();
