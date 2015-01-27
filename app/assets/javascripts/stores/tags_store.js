var ActionTypes = window.CONSTANTS.ActionTypes
var Store = require('./es6_store')

var tags = []

class SuggestedTagsStore extends Store {
  constructor() {
    super()

    this.dispatchIndex = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.TAGS_RECEIVE:
          _tags = action.tags
          this.emitChange()
          break
      }
    })
  }

  getTags() {
    return tags
  }
}

var store = new TagsStore()

var dataTag = document.getElementById('TagsStore')
if (dataTag) {
  var data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.TAGS_RECEIVE,
    tags: data.tags
  })
}

module.exports = store
