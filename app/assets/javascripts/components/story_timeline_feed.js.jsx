'use strict'

const Timeline = require('./ui/timeline.js.jsx');
const Tile = require('./ui/tile.js.jsx');
const Spinner = require('./spinner.js.jsx');
const StoryTimelineStore = require('../stores/story_timeline_store');
const StoryTimelineActions = require ('../actions/story_timeline_actions');

const StoryTimelineFeed = React.createClass({

  propTypes: {
    product: React.PropTypes.object.isRequired
  },

  renderStories: function() {

    return (
      _.map(this.state.stories, function(story, i) {

        var actors = _.map(story.actors, func.dot('username')).join(', @')
        var owner = story.verb == 'awarded' ? story.owner.username : ''

        return (
          <Tile>
            <div className="clearfix p1 py2" key={i}>
              <a href={story.url}>
                <div className="left mr2 mt1">
                  <Avatar user={story.actors[0]} size={18} />
                </div>
                <div className="overflow-hidden">
                  <div className="activity-body">
                    <p className="gray-2 mb0 h6 right mr2">
                      {moment(story.created_at).fromNow()}
                    </p>
                    <p className="mb0 gray-2">
                      <span className="bold">{actors}</span> {story.verb} <strong>{owner}</strong>
                    </p>
                    <p className="mb0">
                      {story.subject}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </Tile>
        )
      })
    )
  },

  render: function() {
    return (
      <div className="px2">
        <div className="px2 mr1 bold gray-2">Activity Feed</div>
        <Timeline>
          <div className="py2">
            {this.renderStories()}
          </div>
          {this.spinner()}
        </Timeline>
      </div>
    )
  },

  getInitialState: function() {
    return (
      _.extend(this.getStateFromStore(), {page: 1, loading: false})
    )
  },

  componentDidMount: function() {
    this.initializeEagerFetching();
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
      loading: StoryTimelineStore.getStories(),
      page: StoryTimelineStore.getPage(),
      stories: _(StoryTimelineStore.getStories()).sortBy((s) => -moment(s.created_at).unix()),
    }
  },

  fetchMoreStoryItems: function(e) {
    this.setState({
      loading: true,
      page: (this.state.page || 1) + 1
    }, function() {
      StoryTimelineActions.requestNextPage(this.props.product)
    }.bind(this));
  },

  initializeEagerFetching: function() {
    var self = this;
    var body = $(document);

    if (body) {
      body.scroll(
        _.throttle(
            function(e) {
              var distanceFromTop = $(window).scrollTop() + $(window).height()

              if (distanceFromTop > $(document).height() - 400) {
                self.fetchMoreStoryItems();
              }
            }, 500)
      );
    }
  },
  spinner: function() {
    if (this.state.loading) {
      return (
        <Spinner />
      );
    }
  }
});

module.exports = StoryTimelineFeed;
