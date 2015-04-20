'use strict'

const Timeline = require('./ui/timeline.js.jsx');
const StoryTimelineStore = require('../stores/story_timeline_store');
const StoryTimelineActions = require ('../actions/story_timeline_actions');

const StoryTimeline = React.createClass({

  propTypes: {
    product: React.PropTypes.object.isRequired
  },

  renderStories: function() {

    return (
      _.map(_.first(this.state.stories, 5), function(story, i) {

        var actors = _.map(story.actors, func.dot('username')).join(', @')

        return (
          <div className="clearfix p1" key={i}>
            <a href={story.url}>
              <div className="left mr2 mt1">
                <Avatar user={story.actors[0]} size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="activity-body">
                  <p className="mb0 gray-2">
                    <span className="bold">{actors}</span> {story.verb}
                  </p>
                  <p className="mb0">
                    {story.subject}
                  </p>
                  <p className="gray-2 mb0 h6">
                    {moment(story.created_at).fromNow()}
                  </p>
                </div>
              </div>
            </a>
          </div>
        )
      })
    )
  },

  render: function() {
    if (this.state.stories.length > 0) {
      return (
        <div className="px2">
          <div className="clearfix border-bottom">
            <div className="left p2 mr1 bold gray-2">Activity Minifeed</div>
            <div className="right p2 ml1">
              <a href={'/' + this.props.product.slug + '/activity'}>
                View all
              </a>
            </div>
          </div>
          <Timeline>
            <div className="py2">
              {this.renderStories()}
            </div>
          </Timeline>
        </div>
      )
    }
    else {
      return (
        <div />
      )
    }
  },

  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentDidMount: function() {
    StoryTimelineStore.addChangeListener(this._onChange)
    StoryTimelineActions.fetchStories(this.props.product)
  },

  componentWillUnmount: function() {
    StoryTimelineStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  getStateFromStore: function() {
    return {
      stories: _(StoryTimelineStore.getStories()).sortBy((s) => -moment(s.created_at).unix()),
    }
  }

});


module.exports = StoryTimeline;
