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
