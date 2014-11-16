(function() {
  // When sprockets doesn't require this file:
  // var keymirror = require('keymirror')

  var CONSTANTS = {
    CHANGE_EVENT: 'change',
    CHAT_NOTIFICATIONS: {
      ACTIONS: {
        ACKNOWLEDGE: 'chat:acknowledge',
        FETCH_CHAT_ROOMS: 'chat:fetchChatRooms',
        MARK_ROOM_AS_READ: 'chat:markRoomAsRead'
      }
    },

    COIN_OWNERSHIP: {
      ACTIONS: {
        ADD_USER: 'addUser',
        REMOVE_USER: 'removeUser',
        UPDATE_USER: 'updateUser'
      }
    },

    CONTRACT: {
      ACTIONS: {
        ADD_CONTRACT: 'addContract',
        REMOVE_CONTRACT: 'removeContract',
        UPDATE_CONTRACT: 'updateContract'
      }
    },

    INTEREST_PICKER: {
      ACTIONS: {
        ADD_INTEREST: 'addInterest',
        REMOVE_INTEREST: 'removeInterest',
        POP: 'pop'
      }
    },

    Love: {
      ActionTypes: keyMirror({
        CLICK_LOVE: null,
        CLICK_UNLOVE: null
      })
    },

    NEWS_FEED_ITEM: {
      ACTIONS: {
        CONFIRM_COMMENT: 'confirmComment',
        OPTIMISTICALLY_ADD_COMMENT: 'optimisticallyAddComment'
      }
    },

    NOTIFICATIONS: {
      ACTIONS: {
        ACKNOWLEDGE: 'notifications:acknowledge',
        FETCH_STORIES: 'notifications:fetchStories',
        FETCH_MORE_STORIES: 'notifications:fetchMoreStories',
        MARK_AS_READ: 'notifications:markAsRead',
        MARK_ALL_AS_READ: 'notifications:markAllAsRead',
        MARK_STORY_AS_READ: 'notifications:markStoryAsRead'
      },
      MORE_STORIES_LENGTH: 20
    },

    NOTIFICATION_PREFERENCES_DROPDOWN: {
      ACTIONS: {
        UPDATE_SELECTED: 'updateSelected'
      }
    },

    PERSON_PICKER: {
      ACTIONS: {
        ADD_USER: 'addPickedUser',
        REMOVE_USER: 'removePickedUser',
        UPDATE_USER: 'updatePickedUser'
      }
    },

    TAG_LIST: {
      ACTIONS: {
        ADD_TAG: 'addTag',
        REMOVE_TAG: 'removeTag'
      }
    },

    TEXT_COMPLETE: {
      ACTIONS: {
        ADD_TAG: 'addTag',
        SETUP: 'SETUP'
      }
    },

    TOGGLE_BUTTON: {
      ACTIONS: {
        CLICK: 'toggleButton:click'
      }
    },

    TYPEAHEAD: {
      ACTIONS: {
        ADD_TAG: 'addTag'
      }
    },

    WELCOME_BANNER: {
      ACTIONS: {
        WELCOME_BANNER_DISMISSED: 'welcomeBannerDismissed'
      }
    },

    PayloadSources: keyMirror({
      SERVER_ACTION: null,
      VIEW_ACTION: null
    })
  };

  if (typeof module !== 'undefined') {
    module.exports = CONSTANTS;
  }

  window.CONSTANTS = CONSTANTS;
})();
