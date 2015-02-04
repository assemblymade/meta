var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');


var PaginationActionCreators = {
  changePage: function(actionCall, page) {
    var queryString = _assembleQueryString(page);
    var path = window.location.pathname + queryString;

    Dispatcher.dispatch({
      type: ActionTypes.PAGINATION_PAGE_CHANGED,
      page: page
    });

    actionCall(path);
  }
};

function _assembleQueryString(page) {
  var query = parseUri(window.location).queryKey || {};
  query.page = page;

  var queries = [];

  for (var q in query) {
    queries.push(q + '=' + query[q]);
  }

  return '?' + queries.join('&');
}

module.exports = PaginationActionCreators;
