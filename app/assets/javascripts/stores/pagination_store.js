var CONSTANTS = window.CONSTANTS
var ActionTypes = CONSTANTS.ActionTypes
// var Dispatcher = require('../dispatcher');
var Store = require('./es6_store')

var currentPage = parseUri(window.location).query.page || 1
var totalPages = 1

class PaginationStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PAGINATION_PAGE_CHANGED:
          _setPage(action)
          this.emitChange()
          break
        case ActionTypes.PAGINATION_TOTAL_PAGES_RECEIVE:
          _setTotalPages(action)
          this.emitChange()
          break
      }
    })
  }

  getCurrentPage() {
    return currentPage
  }

  getTotalPages() {
    return totalPages
  }
}

var store = new PaginationStore()

var dataTag = document.getElementById('PaginationStore')
if (dataTag) {
  Dispatcher.dispatch({
    type: ActionTypes.PAGINATION_TOTAL_PAGES_RECEIVE,
    totalPages: JSON.parse(dataTag.innerHTML).totalPages
  })
}

module.exports = store

function _setPage(action) {
  currentPage = action.page
}

function _setTotalPages(action) {
  totalPages = action.totalPages
}
