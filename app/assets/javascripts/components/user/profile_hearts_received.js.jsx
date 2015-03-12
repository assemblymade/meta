'use strict'

var HeartActions = require('../../actions/heart_actions')
var HeartsReceivedStore = require('../../stores/hearts_received_store')
var Icon = require('../ui/icon.js.jsx')
var PeopleStore = require('../../stores/people_store')
var Spinner = require('../ui/spinner.js.jsx')
var url = require('url')

module.exports = React.createClass({
  displayName: 'ProfileHeartsReceived',

  getInitialState() {
    return this.getStateFromStores()
  },

  render() {
    if (!this.state.stories) {
      return <Spinner />
    }

    return this.renderStories()
  },

  renderStories() {
    var date = null

    let stories = this.state.stories.map(s => {
      var heading = null
      let newDate = moment(s.last_hearted_at).format('dddd, MMMM Do')
      if (date != newDate) {
        date = newDate
        heading = <div className="px2 pt2">{newDate}</div>
      }

      return <div>{heading}{this.renderStory(s, true)}</div>
    })

    return <div>{stories}</div>
  },

  renderStory(story, showBorder) {
    let hearters = story.users.ids.map(PeopleStore.getById)

    return <div className={showBorder ? "border-top border-gray-5" : null}>
      <a href={story.url}
          className="py2 block bg-gray-6-hover ellipsis relative"
          style={{paddingLeft: 54, paddingRight: 44}}>

        <div className="absolute" style={{right: 10}}>
          {story.product ?
              <AppIcon app={story.product} /> :
              <Icon icon={this.iconFor(story.type)} />}
        </div>

        <div className="absolute" style={{left: 40}}>
          {hearters.map(this.renderHearter)}
        </div>

        {` ${hearters[hearters.length-1].username}`}
        <span className="gray-1">
          {story.users.count > 1 ?
            ` and ${story.users.count-1} other${story.users.count == 2 ? '' : 's'} ` : null}
          {' hearted '}
        </span>

        {story.type == 'news_feed_item_comment' ? this.renderComment(story) : story.description}
      </a>
    </div>
  },

  renderHearter(user) {
    return <div className="left" style={{marginLeft:-30, paddingRight: 6}}>
      <Avatar user={user} size={28} />
    </div>
  },

  renderComment(comment) {
    return <span>
      <span className="gray-1">the comment on </span>{comment.nfi.description}<br/>
      <span className="gray-2 italic">{comment.description}</span>
    </span>
  },

  componentDidMount() {
    HeartsReceivedStore.addChangeListener(this._onChange)
    HeartActions.feedSelected(this.props.user_id)
  },

  componentWillUnmount() {
    HeartsReceivedStore.removeChangeListener(this._onChange)
  },

  getStateFromStores() {
    return {
      stories: HeartsReceivedStore.getStories()
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
    this.setState(this.getStateFromStores())
  }
})
