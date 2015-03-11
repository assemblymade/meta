var xhr = require('../xhr');
var WB = require('../constants').WELCOME_BANNER;
var Dispatcher = require('../dispatcher');
var Store = require('./store');
var _store = Object.create(Store);

var WelcomeBannerStore = _.extend(_store, {
});

WelcomeBannerStore.dispatchToken = Dispatcher.register(function(payload) {
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

module.exports = WelcomeBannerStore;
