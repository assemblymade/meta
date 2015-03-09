// This dispatcher modifies some of the ideas in Facebook's template:
// https://github.com/facebook/flux/blob/master/src/Dispatcher.js

var FluxDispatcher = require('flux').Dispatcher;

class AppDispatcher extends FluxDispatcher {
  dispatch(payload) {
    if (!payload.action && !payload.type) {
      console.error('Cannot dispatch null action. Make sure action type is in constants.js');
      return;
    }

    super.dispatch(payload);
  }
};

module.exports = window.Dispatcher = new AppDispatcher();
