'use strict';

const ActionTypes = require('../constants').ActionTypes
const Dispatcher = require('../dispatcher')
const Immutable = require('immutable')
const Store = require('./es6_store')
const UserStore = require('./user_store')

let allPeople = Immutable.Map()
let searchResults = null

class UserSearchStore extends Store {
  constructor() {
    super();

    if (UserStore.getUser()) {
      _addUser(UserStore.getUser())
    }

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_RECEIVE:
          action.product.core_team.map(_addUser)
          break

        case ActionTypes.DISCUSSION_RECEIVE:
          action.events.concat(action.comments).map(o => {
            _addUser(o.user || o.actor)
          })
          break

        default:
          return

        this.emitChange()
      }
    })
  }

  getResults() {
    return allPeople.toList()
  }
}

function _addUser(u) {
  allPeople = allPeople.set(u.id, u)
}

module.exports = new UserSearchStore()
