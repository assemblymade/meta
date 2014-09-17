(function() {
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

    NEWS_FEED: {
      ACTIONS: {
        ACKNOWLEDGE: 'newsFeed:acknowledge',
        FETCH_STORIES: 'newsFeed:fetchStories',
        FETCH_MORE_STORIES: 'newsFeed:fetchMoreStories',
        MARK_AS_READ: 'newsFeed:markAsRead',
        MARK_ALL_AS_READ: 'newsFeed:markAllAsRead',
        MARK_STORY_AS_READ: 'newsFeed:markStoryAsRead'
      },
      MORE_STORIES_LENGTH: 20
    },

    NOTIFICATION_PREFERENCES_DROPDOWN: {
      ACTIONS: {
        UPDATE_SELECTED: 'updateSelected',
        SHOW_PUBLIC_ADDRESS_MODAL: 'showPublicAddressModal'
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
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = CONSTANTS;
  }

  window.CONSTANTS = CONSTANTS;
})();
