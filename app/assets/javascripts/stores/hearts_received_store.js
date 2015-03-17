'use strict'

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
const Store = require('./es6_store')
const PeopleStore = require('./people_store')
const UserStore = require('./user_store')

var heartsCount = null
var stories = null
var lastHeartedAt = 0
let ackKey = '_asm_heart_ack'


if (UserStore.getUser()) {
  let user = UserStore.getUser()
  heartsCount = user.hearts_received
  if (user.last_hearted_at) {
    lastHeartedAt = moment(user.last_hearted_at).unix()
  }
}

class HeartsReceivedStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.HEART_RECEIVED:
          heartsCount = action.data.heartsCount
          lastHeartedAt = moment().unix()
          break

        case ActionTypes.HEARTS_STORIES_RECEIVE:
          Dispatcher.waitFor([PeopleStore.dispatchToken])
          stories = _.sortBy(action.nfis.concat(action.comments), s => -moment(s.last_hearted_at).unix())
          break

        case ActionTypes.HEARTS_ACKNOWLEDGED:
          acknowledge()
          break

        default:
          return // no change
      }
      this.emitChange()
    })
  }

  getHeartsCount() {
    return heartsCount
  }

  getHeartCountForDay(date) {
    let formatted = moment(date).format('YYDDD')
    return _(stories).
      filter(s => moment(s.last_hearted_at).format('YYDDD') == formatted).
      reduce((count, s) => count + s.users.count, 0)
  }

  hasNewHearts() {
    return lastHeartedAt > acknowledgedAt()
  }

  getStories() {
    return stories
  }
}

function acknowledgedAt() {
  return Number(window.localStorage.getItem(ackKey))
}

function acknowledge() {
  window.localStorage.setItem(ackKey, moment().unix())
}

var onStorage = function(e) {
  if (e.key == ackKey) {
    Dispatcher.dispatch({
      type: ActionTypes.HEARTS_ACKNOWLEDGED
    })
  }
}

if (window.addEventListener) {
  window.addEventListener("storage", onStorage, false)
} else {
  window.attachEvent("onstorage", onStorage)
}

module.exports = new HeartsReceivedStore()
