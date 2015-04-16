var CONSTANTS = require('../constants');
var Avatar = require('./ui/avatar.js.jsx');
var Dispatcher = require('../dispatcher');
var EventMixin = require('../mixins/event.js.jsx');
var Spinner = require('./spinner.js.jsx');
var NF = CONSTANTS.NOTIFICATIONS;

var UserStore = require('../stores/user_store')
var StoryStore = require('../stores/story_store')
var StoryActions = require('../actions/story_actions')

var DropdownNotifications = React.createClass({
  render: function() {
    return (
      <ul className="dropdown-menu" style={{ paddingTop: '0px', minWidth: '380px', width: '380px' }}>
        <li style={{ overflowY: 'scroll', minHeight: '60px', maxHeight: '400px' }}>
          {this.state.stories ? this.rows(this.state.stories) : <Spinner />}
        </li>

        <li className="divider" style={{ marginTop: '0px' }} />

        <li>
          <a href="javascript:void(0);" className="text-small" onClick={this.markAllAsRead}>Mark all as read</a>
        </li>
      </ul>
    );
  },

  body: function(story) {
    var sentence = story.sentences.other
    if (story.owner.id == UserStore.getId()) {
      sentence = story.sentences.owner
    }

    return (
      <span dangerouslySetInnerHTML={{__html: sentence}} />
    );
  },

  ellipsis: function(text) {
    if (text && text.length > 100) {
      text = text.substring(0, 100) + '…';
    }

    return text;
  },

  entry: function(options) {
    var story = options.story;

    var classes = ['px2', 'py1', 'block', 'clearfix'];

    if (this.isRead(story)) {
      classes.push('bg-white');
      classes.push('gray-2');
    } else {
      classes.push('bg-gray-6');
      classes.push('gray-1');
    }

    var recentActor = story.actors[story.actors.length - 1]

    var cs = React.addons.classSet.apply(this, classes);

    return (
      <a className={cs}
          href={story.url}
          onClick={this.markAsRead.bind(this, story)}
          key={options.key}>

        <div className="left mr2">
          <Avatar user={recentActor} size={18} />
        </div>
        <div className="overflow-hidden h6 mt0 mb0">
          <span className="bold">
            {` ${recentActor.username} `}
          </span>
          <span className="">
            {story.actors.length > 1 ?
              ` and ${story.actors.length-1} other${story.actors.length == 2 ? '' : 's'} ` : null}
          </span>
          {this.body(story)}<br/>
          {this.preview(story)}
        </div>
      </a>
    );
  },

  isRead: function(story) {
    return story.last_read_at !== 0;
  },

  markAllAsRead: function() {
    StoryActions.markAllAsRead(this.state.stories)
    this.optimisticallyMarkAllAsRead();
  },

  markAsRead: function(story) {
    StoryActions.markAsRead(story)
  },

  optimisticallyMarkAllAsRead: function() {
    var stories = _.clone(this.state.stories);

    for (var i = 0, l = stories.length; i < l; i++) {
      stories[i].last_read_at = moment().unix();
    }

    this.setState({
      stories: stories
    });
  },

  preview: function(story) {
    var body_preview = story.body_preview;

    return (
      <span className='gray-2' style={{
        textOverflow: 'ellipsis',
        'overflow': 'hidden',
        whiteSpace: 'nowrap',
        'display': 'inline-block',
        'width': "280px"
      }}>
        {this.ellipsis(body_preview)}
      </span>
    );
  },

  product: function(story) {
    return ' in ' + story.product_name;
  },

  rows: function(stories) {
    var self = this;

    return (
      <div style={{ maxHeight: '400px', minHeight: '50px' }}>
        { _.map(stories, function(story) {
          var opts = {
            key: story.id,
            story: story,
            actors: self.state.actors
          };

          return self.entry(opts);
        }) }
      </div>
    );
  },

  // stores
  getInitialState: function() {
    return this.getStateFromStore()
  },

  componentDidMount: function() {
    StoryStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    StoryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  },

  getStateFromStore: function() {
    return {
      stories: _(StoryStore.getStories()).sortBy((s) => -moment(s.created_at).unix()),
    }
  }
});

module.exports = window.DropdownNotifications = DropdownNotifications;
