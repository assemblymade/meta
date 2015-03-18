'use strict'

var HeartActions = require('../../actions/heart_actions')
var HeartsReceivedStore = require('../../stores/hearts_received_store')
var Icon = require('../ui/icon.js.jsx')
var PeopleStore = require('../../stores/people_store')
var Spinner = require('../spinner.js.jsx')
var url = require('url')
var UserStore = require('../../stores/user_store')

var leftPadding = 54

module.exports = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  displayName: 'ProfileHeartsReceived',

  getInitialState() {
    return _.extend({
      page: 1,
      more: true,
      loading: true
    }, this.getStateFromStores())
  },

  render() {
    if (!this.state.stories) {
      return <Spinner />
    }

    return <div>
      {this.renderStories()}
      {this.state.stories.size < 5 ? this.renderNewProfile() : null}
      {this.state.loading ? <Spinner /> : null}
    </div>
  },

  renderStories() {
    var date = null

    let stories = this.state.stories.map(s => {
      var heading = null
      let newDate = moment(s.last_hearted_at).format('dddd, MMMM Do')
      if (date != newDate) {
        date = newDate
        heading = <div className="px2 pt4 pb1 gray-2" key={date}>
          <div className="right">
            <span className="gray-2">{this.getHeartCount(s.last_hearted_at)} </span>
            <span className="red">
              <Icon icon="heart" />
            </span>
          </div>

          <span className="mr1 gray-3">
            <Icon icon="calendar" />
          </span>
          {newDate}
        </div>
      }

      return <div>{heading}{this.renderStory(s, heading != null)}</div>
    }).toJS()

    return <div>{stories}</div>
  },

  renderStory(story, showBorder) {
    let hearters = story.users.ids.map(PeopleStore.getById)

    return <div className={showBorder ? "border-top border-gray-5" : null} key={story.id}>
      <a href={story.url}
          className="py2 block bg-gray-6-hover ellipsis relative"
          style={{paddingLeft: leftPadding, paddingRight: 44}}>

        <div className="absolute" style={{right: 10}}>
          {story.product ?
              <AppIcon app={story.product} /> :
              <Icon icon={this.iconFor(story.type)} />}
        </div>

        <div className="absolute" style={{left: 40}}>
          {hearters.map(this.renderHearter)}
        </div>

        {` ${hearters[hearters.length-1].username}`}
        <span className="black">
          {story.users.count > 1 ?
            ` and ${story.users.count-1} other${story.users.count == 2 ? '' : 's'} ` : null}
          {' hearted '}
        </span>

        {story.type == 'news_feed_item_comment' ? this.renderComment(story) : story.description}
      </a>
    </div>
  },

  renderNewProfile() {
    if (this.props.user_id == UserStore.getUsername()) {
      return <div style={{paddingLeft: leftPadding}}>
        <img src="/assets/new_profile.gif" />

        <h3 className="mt1">Oooh! Such a shiny new profile.</h3>
        <p>
          If it feels sparse right now, <strong>don&#39;t panic</strong>. It wont stay that way for long.
          Get started by helping out <a href="/discover">products</a> or collaborate on <a href="/ideas">ideas</a>.
          You&#39;ll earn hearts when others like your stuff. You can even earn ownership in a
          product when you collect App Coins for finishing bounties.
        </p>
      </div>
    }
    return null
  },

  renderHearter(user) {
    return <div className="left" style={{marginLeft:-30, marginTop:-2, paddingRight: 6}} key={user.id}>
      <Avatar user={user} size={28} />
    </div>
  },

  renderComment(comment) {
    return <span>
      <span className="black">the comment on </span>{comment.nfi.description}<br/>
      <span className="gray-2 italic">{comment.description}</span>
    </span>
  },

  componentDidMount() {
    HeartsReceivedStore.addChangeListener(this._onChange)
    this.fetchFeedPage(1)
    window.addEventListener('scroll', this.onScroll);
  },

  componentWillUnmount() {
    HeartsReceivedStore.removeChangeListener(this._onChange)
    window.removeEventListener('scroll', this.onScroll);
  },

  componentDidUpdate(props, state) {
    if (this.state.more && this.state.page > state.page) {
      this.fetchFeedPage(this.state.page)
    }
  },

  fetchFeedPage(page) {
    HeartActions.fetchFeedPage(this.props.user_id, page)
    this.setState({loading: true})
  },

  getHeartCount(date) {
    return HeartsReceivedStore.getHeartCountForDay(date)
  },

  getStateFromStores() {
    return {
      stories: HeartsReceivedStore.getStories(),
      more: HeartsReceivedStore.moreStoriesAvailable()
    }
  },

  iconFor(type) {
    return {
      'idea': 'lightbulb-o',
      'news_feed_item_comment': 'comment-o',
      'post': 'newspaper-o',
      'task': 'check-square-o',
      'team_membership': 'user'
    }[type]
  },

  onScroll() {
    if (this.state.loading) return

    var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

    if (atBottom) {
      this.setState({page: this.state.page + 1})
    }
  },

  sentence(parts, pluralize) {
    switch (parts.length) {
    case 1:
      return `${parts[0]} ${pluralize}s`
      break

    case 2:
      return `${parts.join(' and ')} ${pluralize}`
      break

    case 3:
      return `${parts[0]}, ${parts[1]} and ${parts[2]} ${pluralize}`
      break
    }
  },

  _onChange() {
    this.setState(_.extend({loading: false}, this.getStateFromStores()))
  }
})
