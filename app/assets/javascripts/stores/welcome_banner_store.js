(function() {
  var xhr = require('../xhr');
  var WB = window.CONSTANTS.WELCOME_BANNER;
  // var Dispatcher = require('../dispatcher');
  var Store = require('../stores/store');
  var _store = Object.create(Store);

  var WelcomeBannerStore = _.extend(_store, {
  });

  WelcomeBannerStore.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    switch (action) {
    case WB.ACTIONS.WELCOME_BANNER_DISMISSED:
      setWelcomeBannerDismissedAt(data);
    }

    _store.emitChange();
  });

  function setWelcomeBannerDismissedAt(url) {
    xhr.post(url, {});
  }

  if (typeof module !== 'undefined') {
    module.exports = WelcomeBannerStore;
  }

  window.WelcomeBannerStore = WelcomeBannerStore;
})();
