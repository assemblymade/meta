var Store = require('./es6_store')
var StoryActionCreators = require('../actions/story_action_creators')

var _dispatchToken,
    _more = true,
    _stories = null

var ActionTypes = window.CONSTANTS.ActionTypes;

class StoryStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.STORY_RECEIVE_STORIES:
          _more = action.stories.length == 20;
          if (!_stories) {
            _stories = {}
          }

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

        case ActionTypes.STORY_ACKNOWLEDGE_STORIES:
          localStorage.storyAck = action.timestamp;
          this.emitChange()
          break
      }
    })
  }

  areMoreStoriesAvailable() {
    return _more
  }

  getAcknowledgedAt() {
    return parseInt(localStorage.storyAck) || 0
  }

  getStories() {
    if (!_stories) {
      return null
    }
    return _(_stories).values()
  }

  getLastStory() {
    return _(_(_stories).values()).last()
  }

  getStoryKeys() {
    return _(_stories).map((s)=>{ return s.key })
  }

  getUnviewed() {
    var timestamp = this.getAcknowledgedAt()
    return _(_stories).filter((s)=> s.updated > s.last_read_at && s.updated > timestamp)
  }

  getUnviewedCount() {
    return this.getUnviewed().length
  }
}

var store = new StoryStore()

StoryActionCreators.fetchStories()

module.exports = store
