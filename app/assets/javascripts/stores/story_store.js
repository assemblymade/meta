var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var PusherStore = require('./pusher_store') // don't remove this
var Store = require('./es6_store')
var StoryActions = require('../actions/story_actions')
var UserStore = require('./user_store')

var _dispatchToken,
    _more = true,
    _stories = null

// just a flag to let us know when we've called readraptor
// this way we know if the read state has been validated since
// by default we assume stories are unread
var _readStateReadAt = null

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
          StoryActions.fetchReadState(this.getStoryKeys())
          this.emitChange()
          break

        case ActionTypes.RR_RECEIVE_READ_RECEIPTS:
          _readStateReadAt = new Date()
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

        case ActionTypes.STORY_ADDED:
          StoryActions.fetchStories()
          this.emitChange()
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
    // if we haven't called readraptor then it will look like all stories
    // are unread. We don't know yet, so return 0
    if (!_readStateReadAt) {
      return 0
    }
    var timestamp = this.getAcknowledgedAt()

    return _(_stories).filter((s) =>
      moment(s.updated_at).unix() > s.last_read_at &&
      moment(s.updated_at).unix() > timestamp)
  }

  getUnviewedCount() {
    return this.getUnviewed().length
  }
}

module.exports = new StoryStore()
