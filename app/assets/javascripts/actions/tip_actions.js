var ActionTypes = window.CONSTANTS.ActionTypes;
var routes = require('../routes')

module.exports = {
  tip: function(product_id, viaType, viaId, amount) {
    Dispatcher.dispatch({
      type: ActionTypes.TIP_OPTIMISTIC
    })

    $.ajax({
      type: "POST",
      url: routes.product_tips_path({product_id: product_id}),
      dataType: 'json',
      data: {
        tip: {
          add: amount,
          via_type: viaType,
          via_id: viaId
        }
      },
      complete: function() {
        Dispatcher.dispatch({
          type: ActionTypes.TIP_COMPLETED
        })
    }.bind(this)})

  }
}
