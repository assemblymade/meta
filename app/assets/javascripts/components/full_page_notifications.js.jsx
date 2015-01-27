var CONSTANTS = window.CONSTANTS;
var Avatar = require('./ui/avatar.js.jsx');
// var Dispatcher = require('../dispatcher');
var EventMixin = require('../mixins/event.js.jsx');
var NotificationsStore = require('../stores/notifications_store');
var Spinner = require('./spinner.js.jsx');
var StoryActionCreators = require('../actions/story_action_creators')
var StoryStore = require('../stores/story_store')
var UserStore = require('../stores/user_store')

var FullPageNotifications = React.createClass({
  getDefaultProps: function() {
    return {
      fullPage: true
    };
  },

  moreButton: function() {
    if (this.state.stories && this.state.showMore) {
      return <a href="#more" className="btn btn-block" onClick={this.handleMoreClicked}>More</a>;
    }

    return null;
  },

  render: function() {
    return (
      <div>
        <div className="list-group list-group-breakout">
          {this.renderStories()}
        </div>

        {this.moreButton()}
      </div>
    );
  },

  renderStories: function() {
    if (!this.state.stories) {
      return <Spinner />;
    }

    if (this.state.stories.length > 0) {
      return this.rows(this.state.stories);
    } else {
      this.getStories = function() {};

      return this.emptyRow();
    }
  },

  rows: function(stories) {
    var self = this;

    return _.map(stories, function(story) {
      return <Entry key={story.id + 'f'} story={story} digest={self.props.digest} />;
    });
  },

  emptyRow: function() {
    if (this.props.digest) {
      return (
        <div className="row">
          <div className="col-md-8 col-md-offset-2 col-xs-10 col-xs-1">
            <div className="well well-lg omega">
              <h3 className="alpha">
                <strong>Get notified about products you follow</strong>
              </h3>

              <p className="gray-2 omega">
                Looks like you don't have any notifications yet. Get involved
                with the rest of our community. Follow some products,
                start a discussion, leave a comment or submit some work.
                You'll be notified next time someone responds.
              </p>

              <div className="center">
                <a className="btn btn-primary center" href="/discover" style={{ marginTop: 12 }}>
                  Find products to follow
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="list-group-item">
        <div className="list-group-item-heading">
          Get notified about products you follow
        </div>

        <div className='list-group-item-text'>
          <p className="gray-2 omega">
            Looks like you don't have any notifications yet. Get involved
            with the rest of our community. Follow some products,
            start a discussion, leave a comment or submit some work.
            You'll be notified next time someone responds.
          </p>

          <div className="center">
            <a className="btn btn-primary center" href="/discover" style={{ marginTop: 12 }}>
              Find products to follow
            </a>
          </div>
        </div>
      </div>
    );
  },

  handleMoreClicked: function() {
    StoryActionCreators.fetchStories(StoryStore.getLastStory().id)
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
      stories: StoryStore.getStories(),
      showMore: StoryStore.areMoreStoriesAvailable()
    }
  }
});

var Entry = React.createClass({
  body: function() {
    var story = this.props.story
    var sentence = story.sentences.other
    if (story.owner.id == UserStore.getId()) {
      sentence = story.sentences.owner
    }

    return (
      <span dangerouslySetInnerHTML={{__html: sentence}} />
    );
  },

  isRead: function() {
    return this.props.story.last_read_at !== 0;
  },

  markAsRead: function() {
    StoryActionCreators.markAsRead(this.props.story)
  },

  markAsReadButton: function() {
    if (this.props.digest) {
      return;
    }

    if (!this.isRead()) {
      return <span className="icon icon-disc" onClick={this.markAsRead} title={'Mark as read'} style={{ cursor: 'pointer' }} />;
    }

    // TODO: Mark as unread
    return <span className="icon icon-circle" style={{ cursor: 'pointer' }} />;
  },

  preview: function() {
    var bodyPreview = this.props.story.body_preview;

    return (
      <p className='gray-2' style={{ textOverflow: 'ellipsis' }}>
        {bodyPreview}
      </p>
    );
  },

  render: function() {
    var actors = _.map(this.props.story.actors, func.dot('username')).join(', @')

    var classes = React.addons.classSet({
      'entry-read': !this.props.digest && this.isRead(),
      'entry-unread': !this.props.digest && !this.isRead(),
    });

    var productName = this.props.story.product_name;

    return (
      <div className={classes + ' list-group-item'}>
        <div className='list-group-item-heading'>
          <div className='row'>
            <div className='col-sm-11 col-sm-offset-1 col-xs-10 col-xs-offset-2'>
              <div className='pull-right'>
                {this.markAsReadButton()}
              </div>

              <a href={'/' + this.props.story.product_slug}>
                {productName}
              </a>

              &nbsp;

              <span className='gray-2 text-small'>
                {this.timestamp()}
              </span>
            </div>
          </div>
        </div>

        <div className='list-group-item-text'>
          <div className='row'>
            <div className='col-sm-1 col-xs-2'>
              <Avatar user={this.props.story.actors[0]} />
            </div>

            <div className='col-sm-11 col-xs-10'>
              <a href={this.props.story.url} onClick={this.markAsRead} style={{ 'display': 'block', paddingBottom: '5px' }}>
                <strong>{actors}</strong> {this.body()}
              </a>

              <span className='text-small gray-2'>
                {this.preview()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },

  timestamp: function(story) {
    return moment(story || this.props.story.created_at).format("ddd, hA")
  }
});

module.exports = window.FullPageNotifications = FullPageNotifications;
