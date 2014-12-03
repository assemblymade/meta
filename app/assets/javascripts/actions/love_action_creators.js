// var Dispatcher = require('../dispatcher')
var ActionTypes = window.CONSTANTS.ActionTypes

module.exports = {
  clickLove: function(heartable_type, heartable_id) {
    Dispatcher.dispatch({
      type: ActionTypes.LOVE_CLICKED,
      heartable_type: heartable_type,
      heartable_id: heartable_id
    })

    $.ajax({
      url: '/heartables/love',
      type: 'POST',
      dataType: 'json',
      data: { type: heartable_type, id: heartable_id }
    })
  },

  clickUnlove: function(heartable_type, heartable_id) {
    Dispatcher.dispatch({
      type: ActionTypes.LOVE_UNCLICKED,
      heartable_type: heartable_type,
      heartable_id: heartable_id
    })

    $.ajax({
      url: '/heartables/unlove',
      type: 'POST',
      dataType: 'json',
      data: { type: heartable_type, id: heartable_id }
    })
  },

  retrieveRecentHearts: function(heartable_ids) {
    $.ajax({
      url: '/heartables/hearts',
      type: 'GET',
      dataType: 'json',
      data: {
        heartable_ids: heartable_ids
      },
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.LOVE_RECEIVE_RECENT_HEARTS,
          recent_hearts: data.recent_hearts,
          user_hearts: data.user_hearts
        })
      }
    })
  }
}
