var Store = require('./es6_store')
var SubscriptionActionCreators = require('../actions/story_action_creators')

var _dispatchToken,
    _subscribables = {}

var ActionTypes = window.CONSTANTS.ActionTypes;

class SubscriptionsStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.SUB_RECEIVE_USER_SUBSCRIPTIONS:
          _(action.userSubscriptions).each((sub)=>{
            _subscribables[sub] = sub
          })
          this.emitChange()
          break
        case ActionTypes.NEWS_FEED_ITEM_SUBSCRIBED:
          _subscribables[action.itemId] = 1
          this.emitChange()
          break;
        case ActionTypes.NEWS_FEED_ITEM_UNSUBSCRIBED:
          delete _subscribables[action.itemId]
          this.emitChange()
          break;
      }
    })
  }

  get(id) {
    return !!_subscribables[id]
  }

  isSubscribed(id) {
    return !!_subscribables[id]
  }
}

var store = new SubscriptionsStore()

var dataTag = document.getElementById('UserSubscriptionsStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.SUB_RECEIVE_USER_SUBSCRIPTIONS,
    userSubscriptions: JSON.parse(dataTag.innerHTML)
  })
}

module.exports = store
