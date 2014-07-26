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
              <h3>Notifications</h3>
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

        rows.push(<Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />);
      }

      if (this.props.fullPage) {
        return (
          <div>
            <h3>Notifications</h3>
            {rows}
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

      if (this.props.fullPage) {
        return (
          <div key={this.props.story.id}>
            <a href={this.props.story.url}>
              @{actors} {this.body()}
            </a>
            {this.preview()}
          </div>
        );
      }

      return (
        <li key={this.props.story.id}>
          <a href={this.props.story.url}>
            @{actors} {this.body()}
            {this.preview()}
          </a>
        </li>
      );
    },

    body: function() {
      return this.verbMap[this.props.story.verb] + ' a ' + this.subjectMap[this.props.story.subject_type];
    },

    preview: function() {
      return (
        <p
            className='text-muted'
            style={{
              'font-size': '14px',
              'padding-left': '10px'
            }}>
          {this.props.fullPage ? this.props.story.body_preview : this.ellipsis(this.props.story.body_preview)}
        </p>
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
      'Task': 'task',
      'Discussion': 'discussion',
      'Wip': 'bounty'
    },

    ellipsis: function(text) {
      if (text && text.length > 35) {
        text = text.substring(0, 35) + '…';
      }

      return text;
    }
  });

})();
