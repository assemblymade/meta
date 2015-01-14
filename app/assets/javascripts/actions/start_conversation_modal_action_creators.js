var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;
var Dispatcher = window.Dispatcher;

class StartConversationModalActionCreators {
  hideModal() {
    // FIXME (pletcher) Make this call unnecessary
    $('.modal').modal('hide');

    Dispatcher.dispatch({
      type: ActionTypes.START_CONVERSATION_MODAL_HIDDEN
    });
  }
}

module.exports = new StartConversationModalActionCreators()
