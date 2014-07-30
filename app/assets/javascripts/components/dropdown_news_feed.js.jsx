/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/dropdown_news_feed_store

(function() {

  var NF = CONSTANTS.DROPDOWN_NEWS_FEED;

  window.DropdownNewsFeed = React.createClass({
    getInitialState: function() {
      return {
        stories: null
      };
    },

    componentWillMount: function() {
      DropdownNewsFeedStore.addChangeListener(NF.EVENTS.STORIES_FETCHED, this.getStories);
      this.fetchNewsFeed(this.props.url);
    },

    fetchNewsFeed: _.debounce(function(url) {
      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: url
      });
    }, 1000),

    getStories: function() {
      this.setState({
        stories: DropdownNewsFeedStore.getStories(),
        actors: DropdownNewsFeedUsersStore.getUsers()
      });
    },

    moreStories: function() {
      var lastStory = this.state.stories[this.state.stories.length - 1];

      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_MORE_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: this.props.url + '?top_id=' + lastStory.id
      });
    },

    render: function() {
      return (
        <ul className="dropdown-menu" style={{ 'max-height': '400px', 'overflow-y': 'scroll', width: '300px', 'max-width': '300px', 'min-width': '300px' }}>
          {this.state.stories ? this.rows(this.state.stories) : null}
          <li className="divider" />
          <li>
            <a href='/notifications'>All Notifications</a>
          </li>
        </ul>
      );
    },

    rows: function(stories) {
      var rows = [];

      for (var i = 0, l = stories.length; i < l; i++) {
        if (i > 10) {
          break;
        }

        rows.push(
          <li key={stories[i].key}>
            <Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />
          </li>
        );
      }

      return rows;
    }
  });

  var Entry = React.createClass({
    getInitialState: function() {
      return {
        story: this.props.story
      };
    },

    markAsRead: function() {
      var story = this.state.story;
      story.readAt = Date.now();

      this.setState({
        story: story
      });
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      return (
        <a className={classes} href={this.props.story.url} style={{ 'font-size': '14px' }} onMouseOver={this.state.story.readAt ? null : this.markAsRead}>
          <strong>@{actors}</strong> {this.body()}
          {this.preview()}
        </a>
      );
    },

    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    body: function() {
      var target = this.props.story.activities[0].target;

      return (
        <span>
          {this.verbMap[this.props.story.verb]}
          <strong>
            {this.subjectMap[this.props.story.subject_type].call(this, target)}
          </strong>
        </span>
      );
    },

    isRead: function() {
      var readAt = this.state.story.readAt;

      return readAt != null;
    },

    preview: function() {
      var body_preview = this.props.story.body_preview;

      return (
        <p className='text-muted' style={{ 'text-overflow': 'ellipsis' }}>
          {this.ellipsis(body_preview)}
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
      'Comment': 'commented on ',
      'Award': 'awarded ',
      'Close': 'closed '
    },

    subjectMap: {
      Task: function(task) {
        return "#" + task.number;
      },

      Discussion: function(discussion) {
        return 'discussion'
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title
        }

        return "#" + bounty.number;
      },
    },

    ellipsis: function(text) {
      if (text && text.length > 40) {
        text = text.substring(0, 40) + '…';
      }

      return text;
    }
  });

})();
