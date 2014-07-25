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
        console.log('hello')
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

      return (
        <li>
          <a href="#stories" data-toggle="dropdown">
            <span className='icon icon-bell'></span>
            {badge}
          </a>
        </li>
      );
      // var rows = _.map(this.state.stories, function(story){
      //   return <Entry story={story} actors={this.state.actors} />
      // }.bind(this));
      //
      // return <div>{rows}</div>
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
      return <div className="row">@{actors} {this.body()}</div>
    },

    body: function() {
      return this.props.story.verb + ' on a ' + this.props.story.subject_type

      // if (this.props.activity.subject.body_html) {
      //   return <div className="markdown-normalized" ref="body"></div>
      // } else if (this.props.activity.subject.attachment) {
      //   var href = this.props.activity.subject.attachment.href
      //   var src = this.props.activity.subject.attachment.firesize_url + '/300x225/frame_0/g_center/' + href
      //   return (
      //     <a href={href}>
      //       <img className="gallery-thumb" src={src} />
      //     </a>
      //   )
      // }
    },

    actors: function() {
      return _.map(this.props.story.actor_ids, function(actorId){ return this.props.actors[actorId] }.bind(this))
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.props.story.subject.body_html
      }
    }
  })

})();
