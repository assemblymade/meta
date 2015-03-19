'use strict';

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
const Immutable = require('immutable')
const Store = require('./es6_store')
const UserStore = require('./user_store')

var relevantUsers = Immutable.Map()
var searchedUsers = Immutable.Map()

class UserSearchStore extends Store {
  constructor() {
    super();

    if (UserStore.getUser()) {
      let u = UserStore.getUser()
      relevantUsers = relevantUsers.set(u.id, u)
    }

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_RECEIVE:
          action.product.core_team.map(u => {
            relevantUsers = relevantUsers.set(u.id, u)
          })
          break

        case ActionTypes.PEOPLE_RECEIVE:
          searchedUsers = Immutable.Map()
          action.people.map(u => {
            searchedUsers = searchedUsers.set(u.id, u)
          })
          break

        case ActionTypes.DISCUSSION_RECEIVE:
          action.events.concat(action.comments).map(o => {
            let u = o.user || o.actor
            relevantUsers = relevantUsers.set(u.id, u)
          })
          break

        default:
          return
      }
      this.emitChange()

    })
  }

  getRelevant() {
    return relevantUsers.toList()
  }

  getSearchResults() {
    return searchedUsers.toList()
  }
}

module.exports = new UserSearchStore()
