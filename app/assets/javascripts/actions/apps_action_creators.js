var ActionTypes = window.CONSTANTS.ActionTypes;
var elasticsearch = require('elasticsearch')
var routes = require('../routes')

var AppsActionCreators = {
  search: function(search) {
    Dispatcher.dispatch({
      type: ActionTypes.APPS_START_SEARCH
    });

    var client = new elasticsearch.Client({
      host: document.getElementsByName('es-url')[0].content
    });

    client.search({
      size: 100,
      index: 'products',
      body: {
        query: {
          multi_match: {
            query: search,
            fields: [ 'name.raw^2', 'name', 'pitch', 'marks.name', 'search_tags'],
            operator: 'or',
            fuzziness: 1
          }
        },

        filter: {
          term: {
            hidden: false
          }
        }
      }
    }).then(function (resp) {
      Dispatcher.dispatch({
        type: ActionTypes.APPS_RECEIVE_SEARCH_RESULTS,
        results: resp
      });
    }, function (err) {
      console.trace(err.message);
    });

  },

  filterSelected: function(params) {
    Dispatcher.dispatch({
      type: ActionTypes.APPS_START_SEARCH
    });

    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: routes.apps_path() + '.json',
      data: params,
      success: function(response) {
        Dispatcher.dispatch({
          type: ActionTypes.APPS_RECEIVE,
          apps: response
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  }
};

module.exports = AppsActionCreators;
