(function() {
  var Dispatcher = require('../dispatcher');
  var Store = require('../stores/store');

  var _tags = {};

  var _store = Object.create(Store);
  var _tagListStore = _.extend(_store, {
    addTag: function(data) {
      var scope = data.scope;
      var tag = data.tag;
      var url = data.url;

      if (!_tags.hasOwnProperty(scope)) {
        _tags[scope] = [];
      }

      // We don't want duplicate tags
      if (_searchTags(scope, tag) !== -1) {
        return;
      }

      _tags[scope].push(tag);

      this.persist(scope, url);
    },

    setTags: function(scope, tags) {
      _tags[scope] = tags;
    },

    getTags: function(scope) {
      return _tags[scope] || [];
    },

    removeTag: function(data) {
      var scope = data.scope;
      var tag = data.tag;
      var url = data.url;
      var index = _searchTags(scope, tag);

      if (index >= 0) {
        _tags[scope].splice(index, 1);
      }

      if (url) {
        this.persist(scope, url);
      }
    },

    persist: function(scope, url) {
      if (!url) return;

      var tags = this.getTags(scope);

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
          }
        },

        success: function(data) {
        },

        error: function(jqxhr, status) {
          console.dir(status);
        }
      });
    },

    removeAllTags: function(scope) {
      _tags[scope] = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    _store[action] && _store[action](data);
    _store.emitChange();
  });

  function _searchTags(scope, tag) {
    for (var i = 0, l = _tags[scope].length; i < l; i++) {
      if (_tags[scope][i] === tag) {
        return i;
      }
    }

    return -1
  }

  if (typeof module !== 'undefined') {
    module.exports = _tagListStore;
  }

  window.TagListStore = _tagListStore;
})();
