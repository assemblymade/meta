/** @jsx React.DOM */

(function() {
  var CONSTANTS = window.CONSTANTS;
  var Avatar = require('./avatar.js.jsx');
  // var Dispatcher = require('../dispatcher');
  var EventMixin = require('../mixins/event.js.jsx');
  var NotificationsMixin = require('../mixins/notifications.js.jsx');
  var NotificationsStore = require('../stores/notifications_store');
  var Spinner = require('./spinner.js.jsx');
  var NF = CONSTANTS.NOTIFICATIONS;

  var DropdownNotifications = React.createClass({
    mixins: [EventMixin, NotificationsMixin],

    actors: function(story, actors) {
      return _.map(
        story.actor_ids,
        function(actorId) {
          return _.findWhere(actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function(story) {
      var task = story.verb === 'Start' ? story.subjects[0] : story.target;
      console.log(story);
      return (
        <span>
          {this.verbMap[story.verb]}
          <strong>
            {this.subjectMap[story.subject_type] && this.subjectMap[story.subject_type].call(this, task)}
          </strong>
          {this.product(story)}
        </span>
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

      var actors = _.map(this.actors(story, options.actors), func.dot('username')).join(', @')

      var classes = ['px2', 'py1', 'block', 'clearfix'];

      if (this.isRead(story)) {
        classes.push('bg-white');
        classes.push('gray-2');
      } else {
        classes.push('bg-gray-6');
        classes.push('gray-1');
      }

      var cs = React.addons.classSet.apply(this, classes);

      return (
        <a className={cs}
            href={story.url}
            onClick={this.markAsRead.bind(this, story)}
            key={options.key}>

          <div className="left mr2">
            <Avatar user={this.actors(story, options.actors)[0]} size={18} />
          </div>
          <div className="overflow-hidden h6 mt0 mb0">
            <strong>{actors}</strong> {this.body(story)}<br/>
            {this.preview(story)}
          </div>
        </a>
      );
    },

    isRead: function(story) {
      return story.last_read_at !== 0;
    },

    markAllAsRead: function() {
      Dispatcher.dispatch({
        action: NF.ACTIONS.MARK_ALL_AS_READ,
        data: null,
        sync: true
      });

      this.optimisticallyMarkAllAsRead();
    },

    markAsRead: function(story) {
      story.last_read_at = moment().unix();

      // React doesn't always catch that the story
      // should update, so we need to update it
      // optimistically
      this.setState({
        story: story
      });

      Dispatcher.dispatch({
        action: NF.ACTIONS.MARK_AS_READ,
        data: story.key,
        sync: true
      });
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
        <span className='text-muted' style={{
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

    render: function() {
      return (
        <ul className="dropdown-menu" style={{ paddingTop: '0px', minWidth: '380px', width: '380px' }}>
          <li style={{ overflowY: 'scroll', minHeight: '60px', maxHeight: '400px' }}>
            {this.state.stories ? this.rows(this.state.stories) : <Spinner />}
          </li>

          <li className="divider" style={{ marginTop: '0px' }} />

          <li>
            <a href={this.props.editUserPath} className="text-small">Settings</a>
          </li>

          <li>
            <a href="#mark-as-read" className="text-small" onClick={this.markAllAsRead}>Mark all as read</a>
          </li>

          <li>
            <a href='/dashboard' className="text-small">All Notifications</a>
          </li>

        </ul>
      );
    },

    rows: function(stories) {
      var self = this;

      var firstTen = _.first(stories, 10);

      return (
        <div style={{ maxHeight: '400px', minHeight: '50px' }}>
          { _.map(firstTen, function(story) {
            var opts = {
              key: story.id,
              story: story,
              actors: self.state.actors
            };

            return self.entry(opts);
          }) }
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DropdownNotifications;
  }

  window.DropdownNotifications = DropdownNotifications;
})();
