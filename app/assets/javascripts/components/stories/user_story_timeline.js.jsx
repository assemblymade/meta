const StoryGroup = require('./story_group.js.jsx');

const UserStoryTimelineActions = require ('../../actions/user_story_timeline_actions.js');
const UserStoryTimelineStore = require('../../stores/user_story_timeline_store.js')

const UserStoryTimeline = React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      stories: UserStoryTimelineStore.getStories(),
      products: UserStoryTimelineStore.getProducts()
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  componentDidMount: function() {
    UserStoryTimelineActions.fetchStories(this.props.user);
    UserStoryTimelineStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.onScroll);
    UserStoryTimelineStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div>
        
      </div>
    )
  },

  getStateFromStore: function() {
    return {
      stories: UserStoryTimelineStore.getStories(),
      products: UserStoryTimelineStore.getProducts()
    }
  }

})

module.exports = UserStoryTimeline;
