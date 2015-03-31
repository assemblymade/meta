'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

const requestReadEndpoint = (chatRoom) => {
  $.get(chatRoom.tracking_url);

  Dispatcher.dispatch({
    type: ActionTypes.CHAT_ROOM_MARKED_AS_READ,
    chatRoom: chatRoom
  });
};

const ChatNotificationsActions = {
  markAsRead(rooms) {
    if (!(rooms instanceof Array)) {
      rooms  = [rooms];
    }

    rooms.forEach(requestReadEndpoint);
  }
};

module.exports = ChatNotificationsActions;
