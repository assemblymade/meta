var PusherStore = require('../stores/pusher_store')
var Store = require('./es6_store')
var StoryActionCreators = require('../actions/story_action_creators')
var UserStore = require('./user_store')

var _dispatchToken,
    _more = true,
    _stories = null

// just a flag to let us know when we've called readraptor
// this way we know if the read state has been validated since
// by default we assume stories are unread
var _readStateReadAt = null

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

        case ActionTypes.PUSHER_USER_ACTION:
          if (action.event == 'story-added') {
            StoryActionCreators.fetchStories()
            this.emitChange()
          }
          break;
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
                          s.updated_at > s.last_read_at &&
                          s.updated_at > timestamp)
  }

  getUnviewedCount() {
    return this.getUnviewed().length
  }
}

var store = new StoryStore()

StoryActionCreators.fetchStories()

module.exports = store
