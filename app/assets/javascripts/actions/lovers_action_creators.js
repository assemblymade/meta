var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var Routes = require('../routes');

var LoversActionCreators = {
  retrieveLovers(heartableId) {
    var url = Routes.heartables_lovers_path({
      heartable_id: heartableId
    });

    $.ajax({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.LOVERS_RECEIVE,
          heartableId: heartableId,
          lovers: data.lovers
        });
      }
    });
  }
};

module.exports = LoversActionCreators;
