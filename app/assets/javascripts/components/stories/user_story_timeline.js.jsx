const StoryGroup = require('./story_group.js.jsx');
const Story = require('./story.js.jsx')
const UserStoryTimelineActions = require ('../../actions/user_story_timeline_actions.js');
const UserStoryTimelineStore = require('../../stores/user_story_timeline_store.js')
const Tile = require('.././ui/tile.js.jsx');
const Spinner = require('../spinner.js.jsx');
const { List } = require('immutable');

const UserStoryTimeline = React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired,
    filter: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      stories: [],
      products: [],
      loading: false
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  componentDidMount: function() {
    window.addEventListener('scroll', this.onScroll);
    console.log("FILTER IN TIMELINE", this.props.filter)
    UserStoryTimelineActions.fetchStories(this.props.user, this.props.filter);
    UserStoryTimelineStore.addChangeListener(this._onChange)
  },

  componentDidUpdate: function(props, state) {
    if (props.filter != this.props.filter) {
      this.setState({stories: []});
      UserStoryTimelineActions.fetchNewStories(this.props.user, this.props.filter);
    }
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.onScroll);
    UserStoryTimelineStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div>
        {this.renderStoryGroups()}
        {this.spinner()}
      </div>
    )
  },

  renderStoryGroup: function(stories, groupHeader) {
    var products = this.state.products
    return (
      <div>
        <StoryGroup stories={stories} groupHeader={groupHeader} products={products} />
      </div>
    )
  },

  renderStoryGroups: function() {
    var grouped_stories = List(this.state.stories).groupBy(s => this.dateGroup(s.created_at))

    return (
      <div>
        {grouped_stories.map(this.renderStoryGroup).toJS()}
      </div>
    )
  },

  getStateFromStore: function() {
    var prods = UserStoryTimelineStore.getProducts()
    var stories = UserStoryTimelineStore.getStories()
    var loading = UserStoryTimelineStore.getLoading()

    return {
      stories: stories,
      products: prods,
      loading: loading
    }
  },

  fetchMoreStoryItems: function() {
    if (this.state.loading) { return }

    this.setState({
      loading: true,
      page: (this.state.page || 1) + 1
    }, function() {
      UserStoryTimelineActions.fetchStories(this.props.user, this.props.product)
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

})

module.exports = UserStoryTimeline;
