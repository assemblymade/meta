'use strict';

jest.dontMock('moment');
jest.dontMock(pathToFile('stores/chat_notifications_store'));

describe('ChatNotificationsStore', () => {
  const ActionTypes = require(appFile('constants')).ActionTypes;
  const moment = require('moment');

  let ChatNotificationsStore, Dispatcher, callback;

  beforeEach(() => {
    Dispatcher = require(appFile('dispatcher'))
    ChatNotificationsStore = require(appFile('stores/chat_notifications_store'));

    let chatRooms = {
      123: {
        id: 123,
        readraptor_url: '/clever_girl'
      },
      789: {
        updated: 789,
        last_read_at: 123
      },
      456: {
        updated: 456,
        last_read_at: 123
      }
    };

    callback = Dispatcher.register.mock.calls[0][0]
    callback({
      type: ActionTypes.CHAT_NOTIFICATIONS_CHAT_ROOMS_RECEIVE,
      chatRooms: chatRooms
    });
  });

  describe('getUnreadCount()', () => {
    it('gets the unread chat count', () => {
      expect(ChatNotificationsStore.getUnreadCount(555)).toEqual(1);
    });
  });

  describe('getChatRoom()', () => {
    it('gets the chat room with the specified id', () => {
      expect(ChatNotificationsStore.getChatRoom(123)).toEqual({
        id: 123,
        readraptor_url: '/clever_girl'
      });
    });

    it('returns undefined if the id does not match', () => {
      expect(ChatNotificationsStore.getChatRoom('foo')).toBeUndefined();
    });

    it("overwrites the room's last_read_at property if there's an optimistic value", () => {
      callback({
        type: ActionTypes.CHAT_NOTIFICATIONS_CHAT_ROOM_MARKED_AS_READ,
        id: 789
      });

      expect(ChatNotificationsStore.getChatRoom(789).last_read_at).
        toBeCloseTo(moment().unix(), 5);
    });
  });
});
