'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const UserStore = require('../stores/user_store');

const READRAPTOR_TAG = document.getElementsByName('read-raptor-url')
const READRAPTOR_URL = READRAPTOR_TAG && READRAPTOR_TAG[0] && READRAPTOR_TAG[0].content;

module.exports = window.ChatNotificationsActions = {
  fetchChatRooms(url) {
    $.ajax({
      url: url,
      dataType: 'json',
      success: handleFetchedChatRooms
    });
  },

  markRoomAsRead(roomId, url) {
    $.get(url, noop);

    Dispatcher.dispatch({
      type: ActionTypes.CHAT_NOTIFICATIONS_CHAT_ROOM_MARKED_AS_READ,
      id: roomId
    });
  }
};

function getUnreadRooms(chatRooms) {
  let roomIds = chatRooms.map(room => `key=${room.id}`).join('&');
  let rrUrl = `${READRAPTOR_URL}/readers/${UserStore.getId()}/articles?${roomIds}&${+Date.now()}`;

  $.get(rrUrl, handleReadraptor(chatRooms));
}

function handleFetchedChatRooms(result) {
  let appChatRoom = window.app.chatRoom;
  let chatRooms = result.chat_rooms;
  let sortKeys = result.sort_keys;

  Dispatcher.dispatch({
    type: ActionTypes.CHAT_NOTIFICATIONS_SORT_KEYS_RECEIVE,
    sortKeys: sortKeys
  });

  if (appChatRoom) {
    if (!_.find(chatRooms, roomIdMatches(appChatRoom.id))) {
      chatRooms.push(appChatRoom);
    }
  }

  getUnreadRooms(chatRooms);
}

function handleReadraptor(chatRooms) {
  return (result) => {
    chatRooms = _.reduce(
      chatRooms,
      (hash, story) => {
        hash[story.id] = story;
        hash[story.id].last_read_at = 0;

        return hash;
      },
      {}
    );

    result.forEach((r) => {
      if (r.last_read_at && chatRooms[r.key]) {
        chatRooms[r.key].last_read_at = r.last_read_at;
      }
    });

    Dispatcher.dispatch({
      type: ActionTypes.CHAT_NOTIFICATIONS_CHAT_ROOMS_RECEIVE,
      chatRooms: chatRooms
    });
  }
}

function noop() {};

function roomIdMatches(id) {
  return (room) => {
    return room.id === id;
  };
}
