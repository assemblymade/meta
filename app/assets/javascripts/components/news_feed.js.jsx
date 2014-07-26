/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/news_feed_store

(function() {

  var NF = CONSTANTS.NEWS_FEED;

  window.NewsFeed = React.createClass({
    getInitialState: function() {
      return {
        stories: null,
        acknowledgedAt: this.storedAck()
      };
    },

    componentWillMount: function() {
      NewsFeedStore.addChangeListener(NF.EVENTS.STORIES_FETCHED, this.getStories);
      this.fetchNewsFeed(this.props.url);
    },

    fetchNewsFeed: _.debounce(function(url) {
      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: url,
        async: true
      });
    }, 1000),

    badgeCount: function() {
      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        return this.total();
      }
    },

    latestStoryTimestamp: function() {
      var story = this.latestStory();

      return story && story.updated ? story.updated : 0;
    },

    latestStory: function() {
      var stories = this.state.stories;

      if (!stories) {
        return;
      }

      var story;
      for (var i = 0, l = stories.length; i < l; i++) {
        if (story && stories[i].updated > story.updated) {
          story = stories[i];
        }

        if (!story) {
          story = stories[i];
        }
      }

      return story;
    },

    total: function() {
      var self = this;

      var count = _.reduce(
        _.map(self.state.stories, function(story) {
          return story.updated ? 0 : 1;
        }), function(memo, read) {
          return memo + read;
      }, 0);

      return count;
    },

    getStories: function() {
      this.setState({
        stories: NewsFeedStore.getStories(),
        actors: NewsFeedUsersStore.getUsers()
      });
    },

    render: function() {
      var classes = 'icon icon-bell'

      if (!this.state.stories) {
        if (this.props.fullPage) {
          return (
            <div>
              <h3>All of your notifications</h3>
            </div>
          );
        }

        return <DropdownToggler iconClass={classes} />;
      }

      var total = this.badgeCount();
      var badge = null;

      if (total > 0) {
        badge = <span className='badge badge-notification'>{total}</span>
        classes += ' glyphicon-highlight';
      }

      var rows = [];
      var stories = this.state.stories;

      for (var i = 0, l = stories.length; i < l; i++) {
        if (i > 10) {
          break;
        }

        rows.push(
          <div className="list-group-item" key={stories[i].key}>
            <Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />
          </div>
        );
      }

      if (this.props.fullPage) {
        return (
          <div className="sheet">
            <div className="page-header sheet-header">
              <h2 className="page-header-title">All of your notifications</h2>
            </div>
            <div className="list-group list-group-breakout">
              {rows}
            </div>
          </div>
        );
      }

      return (
        <DropdownToggler iconClass={classes} linkHref='#stories' onClick={this.acknowledge} badge={badge}>
          <ul className="dropdown-menu" style={{ 'max-height': '400px', 'overflow-y': 'scroll', 'text-overflow': 'ellipsis', 'max-width': '300px' }}>
            {rows}
            <li className="divider" />
            <li><a href='/notifications'>All Notifications</a></li>
          </ul>
        </DropdownToggler>
      );
    },

    acknowledge: function() {
      var timestamp = Math.floor(Date.now() / 1000);

      localStorage.notificationsAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });
    },

    storedAck: function() {
      var timestamp = localStorage.newsFeedAck;

      if (timestamp == null || timestamp === "null") {
        return -1;
      } else {
        return parseInt(timestamp, 10);
      }
    }
  });

  var Entry = React.createClass({
    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      })

      if (this.props.fullPage) {
        return (
          <a className={classes} href={this.props.story.url}>
            <strong>@{actors}</strong> {this.body()}
            {this.preview()}
          </a>
        );
      } else {
        return (
          <a className={classes} href={this.props.story.url}>
            <strong>@{actors}</strong> {this.body()}
          </a>
        );
      }
    },

    body: function() {
      var target = this.props.story.activities[0].target;
      return (
        <span>
          {this.verbMap[this.props.story.verb]}
          <strong>
            {this.subjectMap[this.props.story.subject_type](target)}
          </strong>
        </span>
      )
    },

    isRead: function() {
      var readAt = this.props.story.read_at;
      return (typeof readAt !== "undefined" && readAt !== null)
    },

    preview: function() {
      return (
        <span
            className='text-muted'
            >
          &mdash;
          &ldquo;
          {this.props.fullPage ? this.props.story.body_preview : this.ellipsis(this.props.story.body_preview)}
          &rdquo;
        </span>
      );
    },

    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.props.story.subject.body_html;
      }
    },

    verbMap: {
      'Comment': 'commented on',
      'Award': 'awarded',
      'Close': 'closed'
    },

    subjectMap: {
      'Task': function(task) { return "#" + task.number + " " + task.title },
      'Discussion': function() { return 'discussion' },
      'Wip': function() { return 'bounty' }
    },

    ellipsis: function(text) {
      if (text && text.length > 35) {
        text = text.substring(0, 35) + '…';
      }

      return text;
    }
  });

})();
