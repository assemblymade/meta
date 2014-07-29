var CONSTANTS = {
  COIN_OWNERSHIP: {
    ACTIONS: {
      ADD_USER: 'addUser',
      REMOVE_USER: 'removeUser',
      UPDATE_USER: 'updateUser'
    },
    EVENTS: {
      USER_ADDED: 'coinOwnership:userAdded',
      USER_REMOVED: 'coinOwnership:userRevmoed',
      USER_UPDATED: 'coinOwnership:userUpdated'
    }
  },

  DROPDOWN_NEWS_FEED: {
    ACTIONS: {
      FETCH_STORIES: 'fetchStories',
      FETCH_MORE_STORIES: 'fetchMoreStories'
    },
    EVENTS: {
      STORIES_FETCHED: 'newsFeed:storiesFetched'
    }
  },

  INTEREST_PICKER: {
    ACTIONS: {
      ADD_INTEREST: 'addInterest',
      REMOVE_INTEREST: 'removeInterest',
      POP: 'pop'
    },
    EVENTS: {
      INTEREST_ADDED: 'interestPicker:interestAdded',
      INTEREST_REMOVED: 'interestPicker:interestRemoved',
      POPPED: 'interestPicker:popped'
    }
  },

  NOTIFICATION_PREFERENCES_DROPDOWN: {
    ACTIONS: {
      UPDATE_SELECTED: 'updateSelected'
    },
    EVENTS: {
      SELECTED_UPDATED: 'notificationPreferencesDropdown:selectedUpdated'
    }
  },

  PERSON_PICKER: {
    ACTIONS: {
      ADD_USER: 'addPickedUser',
      REMOVE_USER: 'removePickedUser',
      UPDATE_USER: 'updatePickedUser'
    },
    EVENTS: {
      USER_ADDED: 'personPicker:userAdded',
      USER_REMOVED: 'personPicker:userRemoved',
      USER_UPDATED: 'personPicker:userUpdated'
    }
  },

  TAG_LIST: {
    ACTIONS: {
      ADD_TAG: 'addTag',
      REMOVE_TAG: 'removeTag'
    },
    EVENTS: {
      TAG_ADDED: 'textComplete:tagAdded',
      TAG_REMOVED: 'tagList:tagRemoved'
    }
  },

  TEXT_COMPLETE: {
    ACTIONS: {
      ADD_TAG: 'addTag'
    },
    EVENTS: {
      DID_MOUNT: 'textComplete:didMount',
      TAG_ADDED: 'textComplete:tagAdded'
    }
  }
};
