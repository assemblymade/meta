/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/news_feed_store

(function() {

  // actors: Hash[ActiveModel::ArraySerializer.new(@users).as_json.map{|u| [u[:id], u]}],
  // stories: ActiveModel::ArraySerializer.new(
  //   @stories, scope: current_user, each_serializer: StorySerializer
  // ).as_json

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

      return story && story.read_at ? story.read_at : 0;
    },

    latestStory: function() {
      var stories = this.state.stories;

      if (!stories) {
        return;
      }

      var story;
      for (var i = 0, l = stories.length; i < l; i++) {
        if (story && stories[i].read_at > story.read_at) {
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
          return story.read_at ? 0 : 1;
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
      if (!this.state.stories) {
        return <span />;
      }

      var classes = 'icon icon-bell'
      var total = this.badgeCount();
      var badge = null;

      if (total > 0) {
        badge = <span className='badge badge-notification'>{total}</span>
        classes += ' glyphicon-highlight';
      }

      var rows = _.map(this.state.stories, function(story) {
        return (
          <a href={story.url}>
            <Entry story={story} actors={this.state.actors} />
          </a>
        );
      }.bind(this));

      return (
        <li>
          <a href="#stories" data-toggle="dropdown" onClick={this.acknowledge}>
            <span className='icon icon-bell'></span>
            {badge}
          </a>
          <ul className="dropdown-menu">
            {rows}
          </ul>
        </li>
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
      var actors = _.map(this.actors(), func.dot('username')).join(' ,')
      return <li key={this.props.story.id}>@{actors} {this.body()}</li>
    },

    body: function() {
      return this.props.story.verb + ' on a ' + this.props.story.subject_type
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
        this.refs.body.getDOMNode().innerHTML = this.props.story.subject.body_html
      }
    }
  })

})();
