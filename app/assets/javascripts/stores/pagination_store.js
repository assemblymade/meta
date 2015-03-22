var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher')
var Store = require('./es6_store')
var url = require('url')
var qs = require('qs')

var parsedUri = url.parse(window.location.toString())
var query = qs.parse(parsedUri.query) || {}
var currentPage = parseInt(query.page || 1, 10)
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
        case ActionTypes.ASM_APP_ROUTE_CHANGED:
          var query = qs.parse(action.context.path) || {}
          currentPage = parseInt(query.page || 1, 10)
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
  var data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.PAGINATION_TOTAL_PAGES_RECEIVE,
    currentPage: data.current_page,
    totalPages: data.total_pages
  })
}

module.exports = store

function _setPage(action) {
  currentPage = action.page
}

function _setTotalPages(action) {
  totalPages = action.totalPages
}
