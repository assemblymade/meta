var Dispatcher = require('../dispatcher');
var Store = require('./store');

var _tags = [];

var _store = Object.create(Store);
var _tagListStore = _.extend(_store, {
  addTag: function(data) {
    var tag = data.tag;
    var url = data.url;

    // We don't want duplicate tags
    if (_searchTags(tag) !== -1) {
      return;
    }

    _tags.push(tag);

    this.persist(url);
  },

  setTags: function(tags) {
    _tags = tags;
  },

  getTags: function() {
    return _tags;
  },

  removeTag: function(data) {
    var tag = data.tag;
    var url = data.url;
    var index = _searchTags(tag);

    if (index >= 0) {
      _tags.splice(index, 1);
    }

    if (url) {
      this.persist(url);
    }
  },

  persist: function(url) {
    if (!url) return;

    var tags = this.getTags();

    if (_.isEmpty(tags)) {
      tags = [''];
    }

    $.ajax({
      url: url,
      method: 'PATCH',
      dataType: 'json',
      data: {
        task: {
          tag_list: tags
        },
        product: {
          tags: tags
        },
        idea: {
          mark_names: tags
        }
      },

      success: function(data) {},

      error: function(jqxhr, status) {
        console.dir(status);
      }
    });
  },

  removeAllTags: function() {
    _tags = [];
  }
});

_store.dispatchIndex = Dispatcher.register(function(payload) {
  var action = payload.action;
  var data = payload.data;

  _store[action] && _store[action](data);
  _store.emitChange();
});

function _searchTags(tag) {
  for (var i = 0, l = _tags.length; i < l; i++) {
    if (_tags[i] === tag) {
      return i;
    }
  }

  return -1
}

module.exports = _tagListStore;
