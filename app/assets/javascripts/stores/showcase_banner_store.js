var xhr = require('../xhr');
var ActionTypes = require('../constants').ActionTypes
var Dispatcher = require('../dispatcher')
var Store = require('./store')

var _dispatchToken;

var ShowcaseBannerStore = _.extend(Object.create(Store), {
  init: function() {
    _dispatchToken = Dispatcher.register(function(action) {
      switch(action.type) {
        case ActionTypes.SHOWCASE_BANNER_DISMISSED:
          setShowcaseBannerDismissedAt(action.data);
          this.emitChange();
          break;
      }
    }.bind(this))
  }
})

ShowcaseBannerStore.init()

function setShowcaseBannerDismissedAt(url) {
  xhr.post(url, {});
}

module.exports = ShowcaseBannerStore;
