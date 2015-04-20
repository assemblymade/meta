const Story = require('./story.js.jsx');
const Tile = require('.././ui/tile.js.jsx');

const StoryGroup = React.createClass({

  propTypes: {
    stories: React.PropTypes.array.isRequired,
    groupHeader: React.PropTypes.string,
    products: React.PropTypes.object
  },

  renderStory: function(story, i) {
    var product = this.props.products[story.product_id];
    return (
      <div>
        <Story story={story} i={i} product={product} />
      </div>
    )
  },

  renderStoryGroup: function(stories, key) {
    return (
      <div className="py2">
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
        {this.renderStoryGroup(this.props.stories, this.props.groupHeader)}
      </div>
    )
  }

})

module.exports = StoryGroup;
