var keymirror = require('keymirror')

var CONSTANTS = {
  CHANGE_EVENT: 'change',
  CHAT_NOTIFICATIONS: {
    ACTIONS: {
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

  NEWS_FEED_ITEM: {
    ACTIONS: {
      CONFIRM_COMMENT: 'confirmComment',
      OPTIMISTICALLY_ADD_COMMENT: 'optimisticallyAddComment'
    }
  },

  NOTIFICATIONS: {
    ACTIONS: {
      ACKNOWLEDGE: 'notifications:acknowledge',
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


  // TODO: move constants into here. 1 Flat namespace will ensure constants don't collide
  ActionTypes: keymirror({
    APPS_RECEIVE: null,
    APPS_RECEIVE_SEARCH_RESULTS: null,
    APPS_START_SEARCH: null,

    ARCHIVED_NEWS_FEED_ITEMS_RECEIVE: null,

    ASSETS_RECEIVE: null,

    ASM_APP_ROUTE_CHANGED: null,

    ATTACHMENT_FAILED: null,
    ATTACHMENT_UPLOADED: null,
    ATTACHMENT_UPLOADING: null,

    BOUNTY_CLOSED: null,

    BOUNTY_MARKS_RECEIVE: null,

    BOUNTY_RECEIVE: null,

    BOUNTY_WORK_SUBMITTED: null,

    AWARDS_RECEIVE: null,
    BOUNTIES_REQUEST: null,
    BOUNTIES_RECEIVE: null,
    BOUNTIES_REORDER: null,

    BOUNTY_REOPENED: null,

    CHAT_ADDED: null,
    CHAT_MESSAGE_RECEIVE_ACTIVITIES: null,
    CHAT_NOTIFICATIONS_ACKNOWLEDGE: null,
    CHAT_ROOM_MARKED_AS_READ: null,
    CHAT_ROOMS_RECEIVE: null,
    CHAT_USER_ONLINE: null,

    CHECKLIST_ITEMS_RECEIVE: null,

    COMMENT_ADDED: null,

    COMMENT_ATTACHMENT_ADDED: null,
    COMMENT_ATTACHMENT_FAILED: null,
    COMMENT_ATTACHMENT_UPLOADED: null,

    COMMENT_UPDATED: null,
    COMMENT_UPDATE_FAILED: null,
    COMMENT_UPDATE_RECEIVED: null,

    CREATE_PRODUCT_ITEM_ACTIVE_ITEM_RECEIVE: null,

    DASHBOARD_RECEIVE: null,

    DISCUSSION_RECEIVE: null,

    HEARTS_ACKNOWLEDGED: null,
    HEART_RECEIVED: null,
    HEARTS_STORIES_RECEIVE: null,

    IDEA_RECEIVE: null,
    IDEA_UPDATED: null,

    IDEAS_RECEIVE: null,
    IDEAS_NEW_IDEA_CREATED: null,

    IDEA_ADMIN_RECEIVE: null,

    INTRODUCTION_RECEIVE: null,
    INTRODUCTION_UPDATE: null,

    LOVE_CLICKED: null,
    LOVE_UNCLICKED: null,
    LOVE_RECEIVE_HEARTABLES: null,
    LOVE_RECEIVE_ALL_HEARTS: null,
    LOVE_RECEIVE_RECENT_HEARTS: null,
    LOVE_RECEIVE_USER_HEARTS: null,

    LOVERS_RECEIVE: null,

    NEW_COMMENT_UPDATED: null,

    NEWS_FEED_ITEM_ARCHIVED: null,
    NEWS_FEED_ITEM_CONFIRM_COMMENT: null,
    NEWS_FEED_ITEM_OPTIMISTICALLY_ADD_COMMENT: null,
    NEWS_FEED_ITEM_RECEIVE: null,
    NEWS_FEED_ITEM_SUBSCRIBED: null,
    NEWS_FEED_ITEM_UNARCHIVED: null,
    NEWS_FEED_ITEM_UNSUBSCRIBED: null,

    NEWS_FEED_ITEMS_RECEIVE: null,
    NEWS_FEED_ITEMS_REQUEST: null,

    NEWS_FEED_RECEIVE_RAW_ITEMS: null,

    PARTNERS_RECEIVE: null,

    PAGINATION_PAGE_CHANGED: null,
    PAGINATION_TOTAL_PAGES_RECEIVE: null,

    PEOPLE_RECEIVE: null,

    POST_RECEIVE: null,
    POSTS_RECEIVE: null,
    POST_MARKS_RECEIVE: null,

    PROPOSAL_INIT: null,
    PROPOSAL_VOTE: null,

    PRODUCT_FOLLOW_CLICKED: null,
    PRODUCT_FOLLOW_SUCCEEDED: null,
    PRODUCT_FOLLOW_FAILED: null,

    PRODUCT_HEADER_ACTIVE_TAB_CHANGE: null,

    PRODUCT_RECEIVE_FOLLOWER_COUNTS: null,

    PRODUCT_SUBSECTIONS_RECEIVE: null,
    PRODUCT_SUBSECTION_EDITING: null,
    PRODUCT_SUBSECTION_SUBMIT: null,
    PRODUCT_SUBSECTIONS_SUBMITTED: null,

    PRODUCT_UNFOLLOW_CLICKED: null,
    PRODUCT_UNFOLLOW_SUCCEEDED: null,
    PRODUCT_UNFOLLOW_FAILED: null,

    PRODUCT_METRICS_RECEIVED: null,
    PRODUCT_RECEIVE: null,
    PRODUCTS_RECEIVE: null,

    PRODUCTS_SEARCH_INVALIDATE: null,
    PRODUCTS_SEARCH_RECEIVE: null,

    PUSHER_PRESENCE_CONNECTED: null,

    RELATED_IDEAS_RECEIVE: null,

    RR_RECEIVE_READ_RECEIPTS: null,

    SCREENSHOT_SUCCESS: null,
    SCREENSHOT_UPLOADED: null,
    SCREENSHOT_UPLOADING: null,

    SCREENSHOTS_RECEIVE: null,

    SHOWCASE_BANNER_DISMISSED: null,

    SIGNUP_ERRORS: null,
    SIGNUP_MODAL_CHANGED: null,

    STORY_ACKNOWLEDGE_STORIES: null,
    STORY_MARKING_AS_READ: null,
    STORY_MARKED_AS_READ: null,
    STORY_RECEIVE_STORIES: null,

    SUB_RECEIVE_USER_SUBSCRIPTIONS: null,

    TIP_OPTIMISTIC: null,
    TIP_COMPLETED: null,

    USER_MENTIONED: null,
    USER_RECEIVE: null,
    USER_SIGNED_IN: null,

    VALUATION_RECEIVE: null,

    WIP_EVENT_CREATING: null,
    WIP_EVENT_CREATED: null
  })
};

module.exports = window.CONSTANTS = CONSTANTS;
