const Story = require('./story.js.jsx');

const StoryTimeline = React.createClass({

  propTypes: {
    stories: React.PropTypes.array.isRequired
  },

  renderStory: function(story, i) {
    return (
      </div>
        <Story story={story} i={i} />
      </div>
    )
  }

  renderStoryGroup: function(stories, key) {
    return (
      <div>
        <div className="gray-2 px2 pb1 pt2">{key}</div>

        <Tile>
          {stories.map(this.renderStory).toJS()}
        </Tile>
      </div>
    )
  },

  render: function() {
    return (
      <div className="px2">
        {this.renderStoryGroup(this.props.stories, "placeholder2")}
      </div>
    )
  }

})
