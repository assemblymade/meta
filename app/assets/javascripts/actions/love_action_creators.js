var Dispatcher = require('../dispatcher')
var xhr = require('../xhr')
var ActionTypes = require('../constants').Love.ActionTypes

module.exports = {

  clickLove: function(heartable_type, heartable_id) {
    Dispatcher.handleViewAction({
      type: ActionTypes.CLICK_LOVE,
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
    Dispatcher.handleViewAction({
      type: ActionTypes.CLICK_UNLOVE,
      heartable_type: heartable_type,
      heartable_id: heartable_id
    })

    $.ajax({
      url: '/heartables/unlove',
      type: 'POST',
      dataType: 'json',
      data: { type: heartable_type, id: heartable_id }
    })
  }
}
