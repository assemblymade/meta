'use strict'

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
window.Immutable = require('immutable');
const Store = require('./es6_store')
const PeopleStore = require('./people_store')
const UserStore = require('./user_store')

var heartsCount = null
var heartsByDay = Immutable.Map()
var stories = null
var moreStoriesAvailable = true
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
          var newStories = Immutable.List(action.nfis).concat(action.comments).sortBy(s => -moment(s.last_hearted_at).unix())

          stories = stories || Immutable.OrderedMap()
          newStories.map(s => { stories = stories.set(s.id, s) })
          moreStoriesAvailable = newStories.size > 1
          heartsByDay = stories.valueSeq().groupBy(s => moment(s.last_hearted_at).format('YYDDD'))
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
    return heartsByDay.
      get(moment(date).format('YYDDD')).
      map(s => s.users.count).
      reduce((memo, count) => memo + count)
  }

  getStories() {
    return stories
  }

  hasNewHearts() {
    return lastHeartedAt > acknowledgedAt()
  }

  moreStoriesAvailable() {
    return moreStoriesAvailable;
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
