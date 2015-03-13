'use strict'

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
const Store = require('./es6_store')
const PeopleStore = require('./people_store')
const UserStore = require('./user_store')

var heartsCount = null
var stories = null

if (UserStore.getUser()) {
  heartsCount = UserStore.getUser().hearts_received
}

class HeartsReceivedStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.HEART_RECEIVED:
          heartsCount = action.data.heartsCount
          this.emitChange()
          break

        case ActionTypes.HEARTS_STORIES_RECEIVE:
          Dispatcher.waitFor([PeopleStore.dispatchToken])
          stories = _.sortBy(action.nfis.concat(action.comments), s => -moment(s.last_hearted_at).unix())
          this.emitChange()
          break
      }
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

  getStories() {
    return stories
  }
}

module.exports = new HeartsReceivedStore()
