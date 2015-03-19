var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');

module.exports = {
  searchUsers: _.debounce(text => {
    var postData = {
      suggest_username: {
        text: text.toLowerCase(),
        completion: {
          field: 'suggest_username'
        }
      }
    };

    $.ajax({
      url: '/_es/users/_suggest',
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(postData),
      success: function(data) {
        var users = _.map(data.suggest_username[0].options, function(option) {
          return _.extend(option.payload, { username: option.text })
        })
        Dispatcher.dispatch({
          type: ActionTypes.PEOPLE_RECEIVE,
          people: users
        })
      }
    });
  }, 100)
}
