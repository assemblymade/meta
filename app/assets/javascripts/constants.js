var CONSTANTS = {
  TEXT_COMPLETE: {
    ACTIONS: {
      SETUP: 'setUpChosen',
      ADD_TAG: 'addTag'
    },
    EVENTS: {
      DID_MOUNT: 'textComplete:didMount',
      TAG_ADDED: 'textComplete:tagAdded'
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
  }
};
