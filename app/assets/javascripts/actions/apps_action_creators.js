var ActionTypes = window.CONSTANTS.ActionTypes;
var routes = require('../routes')

var AppsActionCreators = {
  filterSelected: function(filter, topic) {
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: routes.apps_path() + '.json',
      data: { filter: filter, topic: topic },
      success: function(apps) {
        Dispatcher.dispatch({
          type: ActionTypes.APPS_RECEIVE,
          apps: apps
        });
      },
      error: function(jqXhr, textStatus, error) {
        console.log(error);
      }
    });
  }
};

module.exports = AppsActionCreators;
