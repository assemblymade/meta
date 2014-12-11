var Store = require('./es6_store')
var StoryActionCreators = require('../actions/story_action_creators')

var _dispatchToken,
    _stories = {}

var ActionTypes = window.CONSTANTS.ActionTypes;

class StoryStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.STORY_RECEIVE_STORIES:
          _(action.stories).each((story)=>{
            _stories[story.id] = story
            _stories[story.id].last_read_at = 0
          })
          StoryActionCreators.fetchReadState(this.getStoryKeys())
          this.emitChange()
          break

        case ActionTypes.RR_RECEIVE_READ_RECEIPTS:
          _(action.articles).each((a)=>{
            var id = a.key.split('_').pop()
            _stories[id].last_read_at = (a.last_read_at || 0)
          })
          this.emitChange()
          break
      }
    })
  }

  getStories() {
    return _(_stories).values()
  }

  getStoryKeys() {
    return _(_stories).map((s)=>{ return s.key })
  }
}

var store = new StoryStore()

StoryActionCreators.fetchStories()

module.exports = store
