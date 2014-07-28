/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/news_feed_store

(function() {

  var NF = CONSTANTS.NEWS_FEED;

  window.NewsFeed = React.createClass({
    getInitialState: function() {
      return {
        stories: null
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

    getStories: function() {
      this.setState({
        stories: NewsFeedStore.getStories(),
        actors: NewsFeedUsersStore.getUsers()
      });
    },

    render: function() {
      if (!this.state.stories) {
        if (this.props.fullPage) {
          return (
            <div>
              <h3>Your notifications</h3>
            </div>
          );
        }
        return <span />
      }

      var rows = [];
      var stories = this.state.stories;

      for (var i = 0, l = stories.length; i < l; i++) {
        if (i > 10) {
          break;
        }

        if (this.props.fullPage) {
          rows.push(
            <div className="list-group-item" key={stories[i].key}>
              <Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />
            </div>
          );
        } else {
          rows.push(
            <li key={stories[i].key}>
              <Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />
            </li>
          );
        }
      }

      if (this.props.fullPage) {
        return (
          <div className="sheet">
            <div className="page-header sheet-header" style={{ 'padding-left': '20px' }}>
              <h2 className="page-header-title">Your notifications</h2>

            </div>
            <div className="list-group list-group-breakout">
              {rows}
            </div>
          </div>
        );
      }

      return (
        <ul className="dropdown-menu" style={{ 'max-height': '400px', 'overflow-y': 'scroll', width: '300px', 'max-width': '300px', 'min-width': '300px' }}>
          {rows}
          <li className="divider" />
          <li>
            <a href='/notifications'>All Notifications</a>
          </li>
        </ul>
      );
    }
  });

  var Entry = React.createClass({
    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      if (this.props.fullPage) {
        return (
          <div>
            <div className='row'>
              <div className='col-md-3'>
                {this.props.story.product.name}
                <br />
                <span className='text-muted text-small'>
                  {this.timestamp()}
                </span>
              </div>
              <div className='col-md-9'>
                <a className={classes} href={this.props.story.url}>
                  <span style={{ 'margin-right': '5px' }}>
                    <Avatar user={this.actors()[0]} />
                  </span>
                  <strong>{actors}</strong> {this.body()}
                </a>
                <span className='text-small text-muted'>
                  {this.preview()}
                </span>
              </div>
            </div>
          </div>
        );
      }

      return (
        <a className={classes} href={this.props.story.url} style={{ 'font-size': '14px' }}>
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
      var readAt = this.props.story.read_at;
      return readAt != null;
    },

    preview: function() {
      var body_preview = this.props.story.body_preview;

      return (
        <p className='text-muted' style={{ 'text-overflow': 'ellipsis' }}>
          {this.props.fullPage ? body_preview : this.ellipsis(body_preview)}
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
      'Award': 'awarded',
      'Close': 'closed'
    },

    subjectMap: {
      Task: function(task) {
        if (this.props.fullPage) {
          return "#" + task.number + " " + task.title
        }

        return "#" + task.number;
      },

      Discussion: function() {
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
