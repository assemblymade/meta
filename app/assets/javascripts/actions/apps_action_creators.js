var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var elasticsearch = require('elasticsearch');
var routes = require('../routes');
var url = require('url');

var AppsActionCreators = {
  initialize: function() {
    var dataTag = document.getElementById('AppsStore')
    if (dataTag) {
      Dispatcher.dispatch({
        type: ActionTypes.APPS_RECEIVE,
        apps: JSON.parse(dataTag.innerHTML)
      })
    } else {
      var query = url.parse(window.location.href, true).query
      if (query.search) {
        this.search(query.search)
      } else {
        this.filterSelected(query)
      }
    }
  },

  search: function(search) {
    Dispatcher.dispatch({
      type: ActionTypes.APPS_START_SEARCH
    });

    var client = new elasticsearch.Client({
      host: document.getElementsByName('es-url')[0].content
    });

    client.search({
      index: 'products',
      size: 100,
      body: {
        query: {
          function_score: {
            query: {
              multi_match: {
                query: search,
                fields: [ 'name.raw^2', 'name', 'pitch', 'marks.name', 'search_tags'],
                operator: 'or',
                fuzziness: 1
              }
            },
            field_value_factor: {
              field: 'trend_score',
              modifier: 'log1p'
            },
            boost_mode: 'sum'
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
      url: routes.discover_path() + '.json',
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
