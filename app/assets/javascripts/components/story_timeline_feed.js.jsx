'use strict'

const { List } = require('immutable');
const ProductActions = require ('../actions/product_actions');
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
    return this.state.stories.
      groupBy(s => this.dateGroup(s.created_at)).
      map(this.renderStoryGroup).toJS()
  },

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

  renderStory: function(story, i) {
    var owner = story.verb == 'awarded' ? story.owner.username : ''
    var recentActor = story.actors[story.actors.length-1]

    var cs = React.addons.classSet({
      'clearfix px2 py2': true,
      'border-top': i > 0
    })

    return (
      <div className={cs} key={i}>
        <a href={story.url}>
          <div className="left mr2 mt1">
            <Avatar user={recentActor} size={18} />
          </div>
          <div className="overflow-hidden">
            <div className="activity-body">
              <p className="gray-2 mb0 h6 right mr2">
                {moment(story.created_at).fromNow()}
              </p>
              <p className="mb0 gray-2">
                <span className="bold">
                  {` ${recentActor.username}`}
                </span>
                <span className="">
                  {story.actors.length > 1 ?
                    ` and ${story.actors.length-1} other${story.actors.length == 2 ? '' : 's'} ` : null}
                </span>
                {' ' + story.verb} <strong>{owner}</strong>
              </p>
              <p className="mb0">
                {story.subject}
              </p>
            </div>
          </div>
        </a>
      </div>
    )
  },

  render: function() {
    return (
      <div className="px2">
        {this.renderStories()}
        {this.spinner()}
      </div>
    )
  },

  getInitialState: function() {
    return (
      _.extend(this.getStateFromStore(), {page: 1, loading: false})
    )
  },

  componentDidMount: function() {
    window.addEventListener('scroll', this.onScroll);
    StoryTimelineStore.addChangeListener(this._onChange)
    StoryTimelineActions.fetchStories(this.props.product)
    ProductActions.changeTab('activity')
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.onScroll);
    StoryTimelineStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  getStateFromStore: function() {
    return {
      loading: StoryTimelineStore.getLoading(),
      page: StoryTimelineStore.getPage(),
      stories: List(StoryTimelineStore.getStories()).sortBy((s) => -moment(s.created_at).unix()),
    }
  },

  fetchMoreStoryItems: function() {
    if (this.state.loading) { return }

    this.setState({
      loading: true,
      page: (this.state.page || 1) + 1
    }, function() {
      StoryTimelineActions.requestNextPage(this.props.product)
    }.bind(this));
  },

  onScroll: function() {
    var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 400

    if (atBottom) {
      this.fetchMoreStoryItems()
    }
  },

  spinner: function() {
    if (this.state.loading) {
      return (
        <Spinner />
      );
    }
  },

  dateGroup: function(time) {
    let at = moment(time)
    let now = moment()
    if (at.isAfter(now.startOf('day'))) {
      return 'Today'
    }

    if (at.isAfter(now.add(-1, 'days').startOf('day'))) {
      return 'Yesterday'
    }

    if (at.isAfter(now.startOf('isoWeek').startOf('day'))) {
      return 'This week'
    }

    if (at.isAfter(now.startOf('month').startOf('day'))) {
      return 'This month'
    }

    if (at.isAfter(now.startOf('year').startOf('day'))) {
      return at.format('MMMM')
    }

    return at.format('MMMM, YYYY')
  }
});

module.exports = StoryTimelineFeed;
